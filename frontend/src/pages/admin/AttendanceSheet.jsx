import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import AdminLayout from '../../components/AdminLayout';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // ✅ Correct import, no manual call needed

function AttendanceSheet({ setAdminToken }) {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceSheet();
  }, [subjectId]);

  const fetchAttendanceSheet = async () => {
    try {
      const response = await api.get(`/api/attendance/attendance-sheet/${subjectId}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching attendance sheet:', error);
      alert('Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (student, session, currentStatus) => {
    setSelectedCell({ student, session, currentStatus });
  };

  const handleToggleAttendance = async (action) => {
    if (!selectedCell) return;
    try {
      await api.post(`/api/attendance/manual-attendance/${selectedCell.session.id}`, {
        studentId: selectedCell.student.studentId,
        action,
        reason: `Manually ${action === 'mark' ? 'marked' : 'unmarked'} by admin`,
      });

      alert(`Attendance ${action === 'mark' ? 'marked' : 'unmarked'} successfully`);
      setSelectedCell(null);
      fetchAttendanceSheet();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update attendance');
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    navigate('/admin/login');
  };

  const downloadPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(67, 56, 202);
    doc.text('Attendance Sheet', 14, 15);

    // Subject info
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text(`${data.subject.code} - ${data.subject.name}`, 14, 23);

    // Stats
    const avg =
      data?.students?.length > 0
        ? (
            data.students.reduce((sum, s) => sum + s.attendancePercentage, 0) /
            data.students.length
          ).toFixed(1)
        : 0;

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Total Students: ${data.totalStudents}  |  Total Sessions: ${data.totalSessions}  |  Average Attendance: ${avg}%`,
      14,
      30
    );

    // Prepare table data
    const tableHeaders = [
      'Student Name',
      'Reg. Number',
      ...data.sessions.map((s) => {
        const date = new Date(s.date);
        return `${date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}\n${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      }),
      'Attendance %',
    ];

    const tableData = data.students.map((student) => [
      student.name,
      student.registrationNumber,
      ...student.attendance.map((record) =>
        record.status === 'present' ? '✓' : '✗'
      ),
      `${student.attendancePercentage.toFixed(1)}%\n(${student.attendedCount}/${student.totalSessions})`,
    ]);

    // Add table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [67, 56, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 40 },
        1: { halign: 'center', cellWidth: 25 },
        [tableHeaders.length - 1]: {
          halign: 'center',
          cellWidth: 20,
          fillColor: [243, 244, 246],
        },
      },
      didParseCell: function (data) {
        // Color code attendance cells
        if (
          data.section === 'body' &&
          data.column.index >= 2 &&
          data.column.index < tableHeaders.length - 1
        ) {
          if (data.cell.raw === '✓') {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
          } else if (data.cell.raw === '✗') {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
          }
        }
        // Color code attendance percentage
        if (data.section === 'body' && data.column.index === tableHeaders.length - 1) {
          const rawText = data.cell.raw.toString().split('%')[0];
          const percentage = parseFloat(rawText);
          if (percentage >= 75) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 163, 74];
          } else if (percentage >= 60) {
            data.cell.styles.fillColor = [254, 249, 195];
            data.cell.styles.textColor = [161, 98, 7];
          } else {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
      margin: { top: 35, left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `Attendance_${data.subject.code}_${new Date()
      .toISOString()
      .split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex justify-center items-center h-[60vh]">
          <h2 className="text-2xl font-semibold text-gray-700 animate-pulse">
            Loading attendance sheet...
          </h2>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex justify-center items-center h-[60vh]">
          <h2 className="text-2xl text-gray-700">No data available</h2>
        </div>
      </AdminLayout>
    );
  }

  // ✅ Define avg once for JSX
  const avg =
    data?.students?.length > 0
      ? (
          data.students.reduce((sum, s) => sum + s.attendancePercentage, 0) /
          data.students.length
        ).toFixed(1)
      : 0;

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/subjects')}
          className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
        >
          ← Back to Subjects
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Attendance Sheet</h1>
              <p className="text-gray-600 text-sm">
                {data.subject.code} — {data.subject.name}
              </p>
            </div>
            {data.totalSessions > 0 && (
              <button
                onClick={downloadPDF}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#dc2626')}
              >
                <svg
                  style={{ width: '14px', height: '14px', flexShrink: 0 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{data.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{data.totalSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700">{avg}%</div>
              <div className="text-sm text-gray-600">Average Attendance</div>
            </div>
          </div>
        </div>

        {/* Rest of your table + modal + tip box remains identical */}
        {/* ... unchanged from your version ... */}
      </div>
    </AdminLayout>
  );
}

export default AttendanceSheet;
