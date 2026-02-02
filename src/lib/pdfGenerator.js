import { jsPDF } from "jspdf";

export const generateConfirmationPdf = (order, retailer, vendor, distributor, poNumber, evidenceFiles) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const addText = (text, size = 12, style = 'normal', color = [0, 0, 0]) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        doc.text(text, 20, y);
        y += size / 2 + 4;
    };

    const addLine = () => {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, pageWidth - 20, y);
        y += 10;
    };

    // --- Title ---
    addText("CDH Platform - Order Confirmation", 22, 'bold', [220, 38, 38]); // CDH Red
    y += 5;
    addText("Order Submission Confirmation", 16, 'normal');
    addLine();

    // --- Details ---
    addText(`Portal PO #: ${poNumber}`, 16, 'bold', [0, 0, 0]);
    addText(`Submitted At: ${new Date().toLocaleString()}`, 11, 'italic', [100, 100, 100]);
    y += 5;

    // --- Parties ---
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`RETAILER:`, 20, y);
    doc.text(`VENDOR:`, pageWidth / 2, y);
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${retailer.name} (${retailer.location})`, 20, y);
    doc.text(`${vendor.name}`, pageWidth / 2, y);
    y += 7;

    doc.setFontSize(10);
    doc.text(`Distributor: ${distributor?.name || 'Manual'}`, pageWidth / 2, y);
    y += 10;

    addLine();

    // --- Items ---
    addText("Order Summary", 14, 'bold');

    let total = 0;
    order.items.forEach(item => {
        const lineTotal = item.qty * item.cost;
        total += lineTotal;
        const line = `${item.sku} - ${item.description.substring(0, 40)}`;
        const qtyCost = `${item.qty} x $${item.cost.toFixed(2)} = $${lineTotal.toFixed(2)}`;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(line, 20, y);
        doc.text(qtyCost, pageWidth - 60, y);
        y += 6;
    });

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: $${total.toFixed(2)}`, pageWidth - 60, y);
    y += 15;

    // --- Evidence ---
    addLine();
    addText("Submission Evidence", 14, 'bold');
    if (evidenceFiles && evidenceFiles.length > 0) {
        evidenceFiles.forEach(file => {
            addText(`- ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 10);
        });
    } else {
        addText("(No files attached)", 10, 'italic');
    }

    y += 10;

    // --- Signature ---
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, pageWidth - 40, 30, 'F');
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text("REP CONFIRMATION REQUIRED", 30, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Please review the attached evidence matches the portal submission.", 30, y);

    return doc.output('datauristring');
};
