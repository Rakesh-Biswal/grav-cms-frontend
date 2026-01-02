"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from "lucide-react"

// Main PDF generator function using html2canvas
export const generateQuotationPDF = async (quotation, request) => {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in browser environment');
  }

  // Create a container for the PDF content
  const pdfContainer = document.createElement('div');
  pdfContainer.style.width = '210mm';
  pdfContainer.style.minHeight = '297mm';
  pdfContainer.style.padding = '15mm';
  pdfContainer.style.backgroundColor = 'white';
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '0';
  pdfContainer.style.fontFamily = 'Arial, Helvetica, sans-serif';
  pdfContainer.style.fontSize = '11px';
  pdfContainer.style.lineHeight = '1.5';
  pdfContainer.style.color = '#000';

  // Format functions
  const formatIndianRupees = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Safely get values with defaults
  const getValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return value;
  };

  // Calculate totals
  const calculateTotals = () => {
    const items = quotation.items || [];
    
    // Calculate item totals
    const itemTotals = items.map(item => {
      const quantity = getValue(item.quantity, 0);
      const unitPrice = getValue(item.unitPrice, 0);
      const discountPercentage = getValue(item.discountPercentage, 0);
      const gstPercentage = getValue(item.gstPercentage, 0);
      
      // Total including GST
      const totalIncludingGST = getValue(item.priceIncludingGST, quantity * unitPrice);
      const discountAmount = totalIncludingGST * (discountPercentage / 100);
      const totalAfterDiscount = totalIncludingGST - discountAmount;
      
      // Calculate GST breakdown
      const baseAmount = totalAfterDiscount / (1 + (gstPercentage / 100));
      const gstAmount = totalAfterDiscount - baseAmount;
      
      return {
        baseAmount,
        gstAmount,
        totalAmount: totalAfterDiscount,
        discountAmount
      };
    });

    const subtotalBeforeGST = itemTotals.reduce((sum, item) => sum + item.baseAmount, 0);
    const totalGST = itemTotals.reduce((sum, item) => sum + item.gstAmount, 0);
    const totalDiscount = itemTotals.reduce((sum, item) => sum + item.discountAmount, 0);
    const shippingCharges = getValue(quotation.shippingCharges, 0);
    const adjustment = getValue(quotation.adjustment, 0);
    const grandTotal = subtotalBeforeGST + totalGST + shippingCharges + adjustment;

    return {
      subtotalBeforeGST,
      totalGST,
      totalDiscount,
      shippingCharges,
      adjustment,
      grandTotal
    };
  };

  const totals = calculateTotals();

  // Build HTML content for the PDF
  pdfContainer.innerHTML = `
    <div style="max-width: 100%; margin: 0 auto;">
      <!-- Header Section -->
      <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #2563eb;">
        <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">GRAV CLOTHING</h1>
        <p style="color: #333; font-size: 12px; margin: 4px 0;">123 Fashion Street, Mumbai, Maharashtra - 400001</p>
        <p style="color: #666; font-size: 11px; margin: 4px 0;">GSTIN: 27AABCU9603R1ZM | Phone: +91 22 1234 5678 | Email: sales@gravclothing.com</p>
        <p style="color: #888; font-size: 10px; margin: 4px 0; font-style: italic;">Premium Clothing Manufacturer & Supplier</p>
      </div>

      <!-- Quotation Title -->
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #1e3a8a; font-size: 24px; margin: 0 0 8px 0; font-weight: bold;">QUOTATION</h2>
        <p style="color: #555; font-size: 13px; margin: 0;">
          No: ${quotation.quotationNumber || 'N/A'} | Date: ${formatDate(quotation.date)} | Valid Until: ${formatDate(quotation.validUntil)}
        </p>
      </div>

      <!-- Customer & Request Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
        <!-- Customer Details -->
        <div style="flex: 1;">
          <h3 style="color: #1e293b; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">BILL TO</h3>
          <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <p style="font-size: 14px; font-weight: bold; margin: 0 0 5px 0; color: #0f172a;">${request.customerInfo?.name || 'Customer Name'}</p>
            <p style="font-size: 11px; margin: 3px 0; color: #475569;">${request.customerInfo?.address || 'Address not specified'}</p>
            <p style="font-size: 11px; margin: 3px 0; color: #475569;">📞 ${request.customerInfo?.phone || 'Phone not provided'}</p>
            <p style="font-size: 11px; margin: 3px 0; color: #475569;">✉️ ${request.customerInfo?.email || 'Email not provided'}</p>
          </div>
        </div>

        <!-- Request Details -->
        <div style="flex: 1; text-align: right;">
          <h3 style="color: #1e293b; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">REQUEST DETAILS</h3>
          <div style="display: inline-block; background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0; text-align: left;">
            <p style="font-size: 11px; margin: 3px 0;"><span style="color: #64748b;">Request ID:</span> <span style="font-weight: bold; color: #0f172a;">${request.requestId || 'N/A'}</span></p>
            <p style="font-size: 11px; margin: 3px 0;"><span style="color: #64748b;">Created Date:</span> ${formatDate(request.createdAt)}</p>
            <p style="font-size: 11px; margin: 3px 0;"><span style="color: #64748b;">Prepared By:</span> Sales Team</p>
          </div>
        </div>
      </div>

      <!-- Opening Message -->
      <div style="background: #eff6ff; padding: 15px; border-radius: 4px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
        <p style="font-size: 11px; margin: 0 0 8px 0; color: #1e40af; font-weight: bold;">
          Dear ${request.customerInfo?.name?.split(' ')[0] || 'Valued Customer'},
        </p>
        <p style="font-size: 11px; margin: 0; color: #1e40af;">
          Thank you for your interest in Grav Clothing's premium apparel collection. We are pleased to provide this quotation for your requested items.
        </p>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">ITEM DETAILS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #2563eb; color: white;">
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: center; width: 5%;">#</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: left; width: 40%;">ITEM DESCRIPTION</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: center; width: 8%;">HSN</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: center; width: 8%;">QTY</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: right; width: 12%;">RATE</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: center; width: 8%;">DISC %</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: center; width: 8%;">GST %</th>
              <th style="border: 1px solid #1d4ed8; padding: 8px; text-align: right; width: 11%;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${(quotation.items || []).map((item, index) => `
              <tr style="${index % 2 === 0 ? 'background: #f8fafc;' : 'background: white;'}">
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; vertical-align: top;">${index + 1}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; vertical-align: top;">
                  <div style="font-weight: bold; font-size: 11px; margin-bottom: 2px;">${item.itemName || 'Item'}</div>
                  ${item.itemCode ? `<div style="font-size: 9px; color: #64748b;">${item.itemCode}</div>` : ''}
                </td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; vertical-align: top;">${item.hsnCode || 'N/A'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; vertical-align: top;">${formatNumber(item.quantity)}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: right; vertical-align: top;">${formatIndianRupees(item.unitPrice)}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; vertical-align: top;">${getValue(item.discountPercentage, 0)}%</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; vertical-align: top;">${getValue(item.gstPercentage, 0)}%</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: right; vertical-align: top; font-weight: bold;">${formatIndianRupees(item.priceIncludingGST)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals and Payment Schedule -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px;">
        <!-- Price Summary -->
        <div style="flex: 1;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">PRICE SUMMARY</h3>
          <div style="background: #f8fafc; padding: 15px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #475569; font-size: 11px;">Subtotal (Before GST):</span>
              <span style="font-weight: bold; color: #0f172a; font-size: 11px;">${formatIndianRupees(totals.subtotalBeforeGST)}</span>
            </div>
            ${totals.totalDiscount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #475569; font-size: 11px;">Total Discount:</span>
                <span style="font-weight: bold; color: #ef4444; font-size: 11px;">-${formatIndianRupees(totals.totalDiscount)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #475569; font-size: 11px;">Total GST:</span>
              <span style="font-weight: bold; color: #0f172a; font-size: 11px;">${formatIndianRupees(totals.totalGST)}</span>
            </div>
            ${totals.shippingCharges > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #475569; font-size: 11px;">Shipping Charges:</span>
                <span style="font-weight: bold; color: #0f172a; font-size: 11px;">${formatIndianRupees(totals.shippingCharges)}</span>
              </div>
            ` : ''}
            ${totals.adjustment !== 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #475569; font-size: 11px;">${totals.adjustment > 0 ? 'Adjustment (+)' : 'Adjustment (-)'}:</span>
                <span style="font-weight: bold; color: ${totals.adjustment > 0 ? '#10b981' : '#ef4444'}; font-size: 11px;">
                  ${totals.adjustment > 0 ? '+' : ''}${formatIndianRupees(totals.adjustment)}
                </span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #2563eb; margin-top: 5px;">
              <span style="font-weight: bold; color: #1e293b; font-size: 13px;">GRAND TOTAL:</span>
              <span style="font-weight: bold; color: #1e40af; font-size: 16px;">${formatIndianRupees(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <!-- Payment Schedule -->
        <div style="flex: 1;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">PAYMENT SCHEDULE</h3>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 4px; border: 1px solid #bae6fd;">
            ${(quotation.paymentSchedule || []).length === 0 ? `
              <p style="text-align: center; color: #64748b; font-size: 11px; padding: 20px 0;">No payment schedule defined</p>
            ` : `
              ${(quotation.paymentSchedule || []).map(payment => `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #7dd3fc;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-weight: bold; color: #0f172a; font-size: 11px;">${payment.stepNumber}. ${payment.name || 'Payment'}</span>
                    <span style="font-weight: bold; color: #0f172a; font-size: 11px;">${formatIndianRupees(payment.amount)} (${getValue(payment.percentage, 0)}%)</span>
                  </div>
                  <div style="color: #64748b; font-size: 10px;">Due: ${formatDate(payment.dueDate)}</div>
                </div>
              `).join('')}
              <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #7dd3fc;">
                <p style="color: #0369a1; font-size: 10px; margin: 0 0 5px 0; font-weight: bold;">Payment Terms:</p>
                <ul style="color: #0369a1; font-size: 9px; margin: 0; padding-left: 15px;">
                  <li>60% advance to confirm order</li>
                  <li>Balance before delivery</li>
                </ul>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- GST Breakdown -->
      <div style="background: #fefce8; padding: 15px; border-radius: 4px; border: 1px solid #fde047; margin-bottom: 25px;">
        <h3 style="color: #854d0e; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">GST BREAKDOWN</h3>
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <p style="color: #854d0e; font-size: 11px; margin: 0 0 5px 0;">CGST</p>
            <p style="color: #a16107; font-size: 14px; font-weight: bold; margin: 0;">${formatIndianRupees(totals.totalGST / 2)}</p>
            <p style="color: #ca8a04; font-size: 10px; margin: 3px 0 0 0;">${totals.subtotalBeforeGST > 0 ? ((totals.totalGST / 2 / totals.subtotalBeforeGST) * 100).toFixed(2) : '0.00'}%</p>
          </div>
          <div>
            <p style="color: #854d0e; font-size: 11px; margin: 0 0 5px 0;">SGST</p>
            <p style="color: #a16107; font-size: 14px; font-weight: bold; margin: 0;">${formatIndianRupees(totals.totalGST / 2)}</p>
            <p style="color: #ca8a04; font-size: 10px; margin: 3px 0 0 0;">${totals.subtotalBeforeGST > 0 ? ((totals.totalGST / 2 / totals.subtotalBeforeGST) * 100).toFixed(2) : '0.00'}%</p>
          </div>
          <div>
            <p style="color: #854d0e; font-size: 11px; margin: 0 0 5px 0; font-weight: bold;">TOTAL GST</p>
            <p style="color: #854d0e; font-size: 18px; font-weight: bold; margin: 0;">${formatIndianRupees(totals.totalGST)}</p>
            <p style="color: #ca8a04; font-size: 10px; margin: 3px 0 0 0;">${totals.subtotalBeforeGST > 0 ? ((totals.totalGST / totals.subtotalBeforeGST) * 100).toFixed(2) : '0.00'}%</p>
          </div>
        </div>
      </div>

      <!-- Notes & Terms -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px;">
        <!-- Notes -->
        <div style="flex: 1;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">NOTES</h3>
          <div style="background: #ecfdf5; padding: 15px; border-radius: 4px; border: 1px solid #a7f3d0; min-height: 120px;">
            ${quotation.notes ? `
              <p style="color: #065f46; font-size: 11px; margin: 0; line-height: 1.5;">${quotation.notes}</p>
            ` : `
              <p style="color: #10b981; font-size: 11px; text-align: center; margin: 40px 0; font-style: italic;">No additional notes provided</p>
            `}
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div style="flex: 1;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">TERMS & CONDITIONS</h3>
          <div style="background: #fef2f2; padding: 15px; border-radius: 4px; border: 1px solid #fecaca; min-height: 120px;">
            <p style="color: #7f1d1d; font-size: 10px; margin: 0; line-height: 1.6;">
              ${quotation.termsAndConditions || 
                '• Prices valid for 30 days from quotation date<br>• 60% advance payment to confirm order<br>• Balance payment before delivery<br>• Delivery within 30 days of order confirmation<br>• GST applicable as per current rates<br>• Colors and shades may vary slightly<br>• Minimum order quantity applies for bulk orders'
              }
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #2563eb; padding-top: 15px; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px;">
          <div>
            <p style="color: #6b7280; font-size: 10px; margin: 0 0 4px 0;">For GRAV CLOTHING</p>
            <p style="color: #9ca3af; font-size: 9px; margin: 0; font-style: italic;">Premium Quality | Timely Delivery | Customer Satisfaction</p>
          </div>
          <div style="text-align: right;">
            <p style="color: #6b7280; font-size: 10px; margin: 0 0 4px 0;">Authorized Signatory</p>
            <div style="border-top: 1px solid #d1d5db; width: 150px; margin-left: auto;"></div>
          </div>
        </div>
        <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          <p style="color: #9ca3af; font-size: 9px; margin: 0 0 4px 0;">This is a computer-generated quotation. No signature required.</p>
          <p style="color: #9ca3af; font-size: 9px; margin: 0;">Page 1 of 1 | Generated on ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(pdfContainer);

  try {
    // Convert to canvas with higher scale for better quality
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: pdfContainer.offsetWidth,
      height: pdfContainer.offsetHeight,
      windowWidth: pdfContainer.scrollWidth,
      windowHeight: pdfContainer.scrollHeight,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    return pdf;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(pdfContainer);
  }
};

// Helper function to download PDF
export const downloadQuotationPDF = async (quotation, request) => {
  if (!quotation || !request) {
    console.error("Invalid data for PDF download:", { quotation, request });
    alert("No valid quotation data available for download");
    return;
  }

  try {
    // Validate required data
    if (!quotation.quotationNumber || !quotation.items || !request.customerInfo) {
      alert("Incomplete quotation data. Please save the quotation first.");
      return;
    }

    const pdfDoc = await generateQuotationPDF(quotation, request);
    const fileName = `quotation-${quotation.quotationNumber || 'unknown'}.pdf`;
    pdfDoc.save(fileName);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please check the console for details.");
  }
};

// React component for PDF download button
export default function QuotationPDFDownload({ quotation, request }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!quotation || !request) {
      alert("No quotation data available");
      return;
    }

    // Validate required data
    if (!quotation.quotationNumber || !quotation.items || !request.customerInfo) {
      alert("Incomplete quotation data. Please save the quotation first.");
      return;
    }

    setIsGenerating(true);
    try {
      await downloadQuotationPDF(quotation, request);
    } catch (error) {
      console.error("Error in PDF download:", error);
      alert("Failed to download PDF. Please check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating || !quotation || !request}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </button>
  );
}