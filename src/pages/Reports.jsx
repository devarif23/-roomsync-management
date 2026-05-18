import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileText, Image, FileSpreadsheet, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

export default function Reports() {
  const { expenses, members } = useAppContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const [exportingType, setExportingType] = useState(null);

  const downloadCSV = () => {
    const myMember = members.find(m => m.phone === user?.phone);
    const myId = myMember?.id;

    const rows = [['Month', 'WiFi', 'Electricity', 'Rent', 'Other', 'Total', 'Paid', 'Due', 'Status']];
    Object.entries(expenses).forEach(([month, recs]) => {
      const myRecs = isAdmin ? recs : recs.filter(r => r.memberId === myId);
      myRecs.forEach(r => {
        const total = (r.wifi||0)+(r.electricity||0)+(r.rent||0)+(r.other||0);
        const due = total - (r.paid||0);
        const status = due<=0 ? 'Paid' : r.paid>0 ? 'Partial' : 'Due';
        rows.push([month, r.wifi||0, r.electricity||0, r.rent||0, r.other||0, total, r.paid||0, Math.max(due,0), status]);
      });
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `roomsync_${isAdmin ? 'all' : (user?.name || 'user').toLowerCase().replace(/\s+/g, '_')}_data.csv`;
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const captureElement = async () => {
    const element = document.getElementById('report-container');
    if (!element) return null;
    return await html2canvas(element, { 
      scale: 2, 
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0b1329' : '#ffffff',
      useCORS: true
    });
  };

  const downloadBlobFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const downloadPNG = async () => {
    setExportingType('png');
    try {
      const canvas = await captureElement();
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) downloadBlobFile(blob, `roomsync_report_${Date.now()}.png`);
        setExportingType(null);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating PNG:', err);
      setExportingType(null);
    }
  };

  const downloadJPG = async () => {
    setExportingType('jpg');
    try {
      const canvas = await captureElement();
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) downloadBlobFile(blob, `roomsync_report_${Date.now()}.jpg`);
        setExportingType(null);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Error generating JPG:', err);
      setExportingType(null);
    }
  };

  const downloadPDF = async () => {
    setExportingType('pdf');
    try {
      const canvas = await captureElement();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const blob = pdf.output('blob');
      downloadBlobFile(blob, `roomsync_report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setExportingType(null);
    }
  };

  const areaData = useMemo(() => {
    return Object.entries(expenses).map(([month, records]) => {
      let Total = 0;
      let Paid = 0;
      records.forEach(r => {
        Total += (r.wifi || 0) + (r.electricity || 0) + (r.rent || 0) + (r.other || 0);
        Paid += (r.paid || 0);
      });
      return {
        name: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
        [t('paid')]: Paid,
        [t('due')]: Total - Paid
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [expenses, t]);

  const pieData = useMemo(() => {
    let wifi = 0, electricity = 0, rent = 0, other = 0;
    Object.values(expenses).forEach(records => {
      records.forEach(r => {
        wifi += r.wifi || 0;
        electricity += r.electricity || 0;
        rent += r.rent || 0;
        other += r.other || 0;
      });
    });
    return [
      { name: t('rent'), value: rent },
      { name: t('wifi'), value: wifi },
      { name: t('electricity'), value: electricity },
      { name: t('other'), value: other },
    ].filter(d => d.value > 0);
  }, [expenses, t]);

  return (
    <div className="space-y-6" id="report-container" style={{ padding: '16px', borderRadius: '12px' }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports')}</h2>
          <p className="text-muted-foreground">{t('analytics_history')} ({isAdmin ? 'All Data' : 'My Data'})</p>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-html2canvas-ignore="true">
          <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-1.5 font-medium">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span>CSV</span>
          </Button>
          <Button onClick={downloadPDF} disabled={exportingType !== null} variant="outline" size="sm" className="gap-1.5 font-medium">
            {exportingType === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <FileText className="h-4 w-4 text-red-500" />}
            <span>PDF</span>
          </Button>
          <Button onClick={downloadPNG} disabled={exportingType !== null} variant="outline" size="sm" className="gap-1.5 font-medium">
            {exportingType === 'png' ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <Image className="h-4 w-4 text-blue-500" />}
            <span>PNG</span>
          </Button>
          <Button onClick={downloadJPG} disabled={exportingType !== null} variant="outline" size="sm" className="gap-1.5 font-medium">
            {exportingType === 'jpg' ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Image className="h-4 w-4 text-amber-500" />}
            <span>JPG</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('income_vs_due')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              {areaData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis tickFormatter={(v) => `৳${v}`} fontSize={12} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip formatter={(value) => [`৳ ${value}`, '']} />
                    <Area type="monotone" dataKey={t('paid')} stroke="#10b981" fillOpacity={1} fill="url(#colorPaid)" />
                    <Area type="monotone" dataKey={t('due')} stroke="#ef4444" fillOpacity={1} fill="url(#colorDue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {t('no_data_yet')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('expense_distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`৳ ${value}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {t('no_data_yet')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
