import jsPDF from 'jspdf';

const colors = {
  darkBlue: '#1e3a5f',
  good: '#22c55e',
  fair: '#f59e0b',
  poor: '#ef4444',
  na: '#9ca3af',
};

const getConditionColor = (condition) => {
  switch (condition) {
    case 'good':
      return colors.good;
    case 'fair':
      return colors.fair;
    case 'poor':
      return colors.poor;
    case 'na':
      return colors.na;
    default:
      return colors.na;
  }
};

const getConditionLabel = (condition) => {
  const labels = {
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    na: 'N/A',
  };
  return labels[condition] || 'Unknown';
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return '#3b82f6'; // blue
    case 'medium':
      return '#eab308'; // yellow
    case 'high':
      return '#f97316'; // orange
    case 'urgent':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

export const generateInspectionPDF = async (state) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Page 1: Cover
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(colors.darkBlue);
  doc.text('PROPERTY INSPECTION', pageWidth / 2, yPosition, { align: 'center' });
  doc.text('REPORT', pageWidth / 2, yPosition + 12, { align: 'center' });

  yPosition += 40;

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const reportData = [
    ['Property Address:', state.listing?.displayAddress || `${state.listing?.address1}${state.listing?.city ? ', ' + state.listing?.city : ''}`],
    ['Reference:', state.listing?.reference || 'N/A'],
    ['Inspection Date:', new Date(state.details.inspectionDate).toLocaleDateString()],
    ['Agent:', state.details.agentName || 'N/A'],
    ['Type:', state.details.inspectionType || 'Routine'],
  ];

  reportData.forEach(([label, value]) => {
    doc.setFont('Helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('Helvetica', 'normal');
    doc.text(value, 70, yPosition);
    yPosition += 8;
  });

  // Page 2+: Rooms
  state.rooms.forEach((room) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.darkBlue);
    doc.text(room.name, 20, yPosition);

    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Condition badge
    doc.setFillColor(...hexToRgb(getConditionColor(room.condition)));
    doc.rect(20, yPosition - 4, 30, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(getConditionLabel(room.condition), 35, yPosition + 1, { align: 'center' });

    yPosition += 10;

    // Notes
    if (room.notes) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      const notes = doc.splitTextToSize(room.notes, pageWidth - 40);
      notes.forEach((line) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    }

    // Photos
    if (room.photos && room.photos.length > 0) {
      yPosition += 5;
      const photosPerRow = 2;
      const photoWidth = (pageWidth - 40) / photosPerRow;
      const photoHeight = 30;

      for (let i = 0; i < room.photos.length; i++) {
        const col = i % photosPerRow;
        const row = Math.floor(i / photosPerRow);

        const x = 20 + col * photoWidth;
        const y = yPosition + row * (photoHeight + 5);

        if (y + photoHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        try {
          doc.addImage(room.photos[i], 'JPEG', x, yPosition + row * (photoHeight + 5), photoWidth - 5, photoHeight);
        } catch (e) {
          console.error('Failed to add image:', e);
        }
      }
      yPosition += Math.ceil(room.photos.length / photosPerRow) * (photoHeight + 5) + 5;
    }

    yPosition += 10;
  });

  // Utilities page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.darkBlue);
  doc.text('Utilities & Safety', 20, yPosition);
  yPosition += 12;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const utilitiesData = [
    ['Gas Meter:', state.utilities.gas.reading || 'N/A'],
    ['Electric Meter:', state.utilities.electric.reading || 'N/A'],
    ['Water Meter:', state.utilities.water.reading || 'N/A'],
    ['Smoke Alarm Tested:', state.utilities.smokeAlarm ? 'Yes' : 'No'],
    ['CO Alarm Tested:', state.utilities.coAlarm ? 'Yes' : 'No'],
    ['Keys Present:', state.utilities.keysPresent || 'N/A'],
  ];

  utilitiesData.forEach(([label, value]) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFont('Helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('Helvetica', 'normal');
    doc.text(value, 80, yPosition);
    yPosition += 7;
  });

  // Issues page
  if (state.issues.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.darkBlue);
    doc.text('Maintenance Issues', 20, yPosition);
    yPosition += 12;

    state.issues.forEach((issue) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${issue.room || 'Unlabeled'}`, 20, yPosition);

      // Priority badge
      doc.setFillColor(...hexToRgb(getPriorityColor(issue.priority)));
      doc.rect(100, yPosition - 3, 20, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(issue.priority.toUpperCase(), 110, yPosition + 1, { align: 'center' });

      yPosition += 7;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const description = doc.splitTextToSize(issue.description, pageWidth - 40);
      description.forEach((line) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });
  }

  // Save and download
  doc.save('inspection-report.pdf');
  return doc;
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : [0, 0, 0];
}
