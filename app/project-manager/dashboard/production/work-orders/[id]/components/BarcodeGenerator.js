// app/project-manager/dashboard/production/work-orders/[id]/components/BarcodeGenerator.jsx - UPDATED

"use client";

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as JsBarcode from 'jsbarcode';

const BarcodeGenerator = ({ workOrder, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [barcodeData, setBarcodeData] = useState([]);
    const [pdfSettings, setPdfSettings] = useState({
        paperSize: 'A4',
        barcodesPerRow: 3
    });

    // Simple checksum function
    const generateChecksum = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase().substring(0, 4).padStart(4, '0');
    };

    // Generate barcode data with improved format
    const generateBarcodeData = () => {
        if (!workOrder || !workOrder.operations || workOrder.operations.length === 0) {
            return [];
        }

        const barcodes = [];

        // Extract WO number without prefix if present
        const woNumber = workOrder.workOrderNumber || workOrder._id.toString().slice(-8);

        for (let unit = 1; unit <= workOrder.quantity; unit++) {
            for (let opIndex = 0; opIndex < workOrder.operations.length; opIndex++) {
                const operation = workOrder.operations[opIndex];

                // Generate base barcode ID
                const baseId = `${woNumber}-${unit.toString().padStart(3, '0')}-${(opIndex + 1).toString().padStart(2, '0')}`;

                // Add checksum
                const checksum = generateChecksum(baseId);
                const barcodeId = `${baseId}-${checksum}`;

                barcodes.push({
                    id: barcodeId,
                    baseId: baseId,
                    checksum: checksum,
                    unitNumber: unit,
                    opNumber: opIndex + 1,
                    opType: operation.operationType,
                    opMachine: operation.assignedMachineName || 'Not Assigned',
                    productCode: workOrder.stockItemReference,
                    productName: workOrder.stockItemName,
                    variant: workOrder.variantAttributes
                        ?.map(attr => attr.value?.substring(0, 1).toUpperCase())
                        .join('/') || 'STD',

                    workOrderNumber: woNumber
                });
            }
        }

        return barcodes;
    };

    // Initialize barcodes
    useEffect(() => {
        const barcodes = generateBarcodeData();
        setBarcodeData(barcodes);
    }, [workOrder]);

    // Function to generate barcode image data URL
    const generateBarcodeImage = (barcodeId) => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;

        try {
            JsBarcode(canvas, barcodeId, {
                format: 'CODE128',
                width: 1.2,
                height: 30,
                displayValue: false,
                margin: 0,
                background: '#ffffff',
                lineColor: '#000000'
            });
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error generating barcode:', error);
            return null;
        }
    };

    // Generate PDF with real barcodes
    const generatePDF = async () => {
        if (barcodeData.length === 0) return;

        setLoading(true);
        try {
            const doc = new jsPDF('p', 'mm', pdfSettings.paperSize);
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Layout settings
            const margin = 10;
            const barcodeWidth = 60;
            const barcodeHeight = 30;
            const barcodeImageHeight = 15;
            const labelHeight = 10;
            const totalItemHeight = barcodeHeight + labelHeight;

            const barcodesPerRow = pdfSettings.barcodesPerRow;
            const availableWidth = pageWidth - (2 * margin);
            const horizontalSpacing = (availableWidth - (barcodesPerRow * barcodeWidth)) / (barcodesPerRow + 1);

            // Header
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 128);
            doc.text('PRODUCTION TRACKING BARCODES', pageWidth / 2, margin, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Work Order: ${workOrder.workOrderNumber}`, pageWidth / 2, margin + 7, { align: 'center' });
            doc.text(`Product: ${workOrder.stockItemName}`, pageWidth / 2, margin + 12, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleDateString()} | Units: ${workOrder.quantity} | Barcodes: ${barcodeData.length}`,
                pageWidth / 2, margin + 17, { align: 'center' });

            let currentY = margin + 25;

            // Group barcodes by unit
            const barcodesByUnit = {};
            barcodeData.forEach(barcode => {
                if (!barcodesByUnit[barcode.unitNumber]) {
                    barcodesByUnit[barcode.unitNumber] = [];
                }
                barcodesByUnit[barcode.unitNumber].push(barcode);
            });

            // Process each unit
            const unitNumbers = Object.keys(barcodesByUnit).sort((a, b) => a - b);

            for (const unitNumber of unitNumbers) {
                const unitBarcodes = barcodesByUnit[unitNumber];

                // Check if we need new page
                const rowsNeeded = Math.ceil(unitBarcodes.length / barcodesPerRow);
                const spaceNeeded = rowsNeeded * totalItemHeight + 8;

                if (currentY + spaceNeeded > pageHeight - margin) {
                    doc.addPage();
                    currentY = margin;
                }

                // Unit header
                doc.setFontSize(11);
                doc.setTextColor(0, 100, 0);
                doc.text(`Unit ${unitNumber}:`, margin, currentY);
                doc.setDrawColor(0, 100, 0);
                doc.setLineWidth(0.5);
                doc.line(margin, currentY + 1, margin + 20, currentY + 1);

                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                currentY += 5;

                // Process barcodes for this unit
                for (let i = 0; i < unitBarcodes.length; i++) {
                    const barcode = unitBarcodes[i];
                    const col = i % barcodesPerRow;
                    const row = Math.floor(i / barcodesPerRow);

                    const x = margin + col * (barcodeWidth + horizontalSpacing);
                    const y = currentY + row * totalItemHeight;

                    // Generate barcode image
                    const barcodeImage = generateBarcodeImage(barcode.id);

                    if (barcodeImage) {
                        // Add border
                        doc.setDrawColor(200, 200, 200);
                        doc.setLineWidth(0.3);
                        doc.roundedRect(x, y, barcodeWidth, barcodeHeight, 1, 1);

                        // Add barcode image
                        doc.addImage(barcodeImage, 'PNG', x + 3, y + 2, barcodeWidth - 6, barcodeImageHeight);

                        // Add barcode ID
                        doc.setFontSize(7);
                        doc.setTextColor(100, 100, 100);
                        doc.text(barcode.baseId, x + barcodeWidth / 2, y + barcodeImageHeight + 5, { align: 'center' });

                        // Add operation info
                        doc.setFontSize(8);
                        doc.setTextColor(0, 0, 0);
                        const opText = `Op${barcode.opNumber}: ${barcode.opType.substring(0, 12)}`;
                        doc.text(opText, x + 3, y + barcodeImageHeight + 10);

                        // Add checksum
                        doc.setFontSize(6);
                        doc.setTextColor(128, 0, 0);
                        doc.text(`Chk: ${barcode.checksum}`, x + barcodeWidth - 15, y + barcodeImageHeight + 10);
                    }
                }

                // Move to next unit position
                const rowsUsed = Math.ceil(unitBarcodes.length / barcodesPerRow);
                currentY += rowsUsed * totalItemHeight + 10;
            }

            // Add summary page
            doc.addPage();
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 128);
            doc.text('BARCODE INFORMATION', pageWidth / 2, margin, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            let yPos = margin + 20;

            // Work Order Info
            doc.text('Work Order Details:', margin, yPos);
            yPos += 8;

            doc.setFontSize(9);
            const details = [
                `Work Order: ${workOrder.workOrderNumber}`,
                `Product: ${workOrder.stockItemName}`,
                `Product Code: ${workOrder.stockItemReference}`,
                `Quantity: ${workOrder.quantity} units`,
                `Operations: ${workOrder.operations?.length || 0}`,
                `Total Barcodes: ${barcodeData.length}`,
                `Generated: ${new Date().toLocaleString()}`
            ];

            details.forEach(detail => {
                doc.text(detail, margin + 5, yPos);
                yPos += 6;
            });

            yPos += 10;

            // Barcode Format Explanation
            doc.setFontSize(10);
            doc.text('Barcode Format:', margin, yPos);
            yPos += 8;

            doc.setFontSize(9);
            doc.text('[WorkOrderNumber]-[Unit3]-[Operation2]-[Checksum4]', margin + 5, yPos);
            yPos += 6;
            doc.text('Example:', margin + 5, yPos);
            yPos += 6;
            const example = barcodeData[0]?.id || 'WO-241206-1234-001-01-C5F8';
            doc.text(example, margin + 10, yPos);
            yPos += 6;
            doc.text('✓ WorkOrderNumber: Actual Work Order number from database', margin + 5, yPos);
            yPos += 5;
            doc.text('✓ Unit3: Unit number (3 digits, zero-padded)', margin + 5, yPos);
            yPos += 5;
            doc.text('✓ Operation2: Operation number (2 digits, zero-padded)', margin + 5, yPos);
            yPos += 5;
            doc.text('✓ Checksum4: Validation code (4 hex digits)', margin + 5, yPos);

            yPos += 15;

            // Operations List
            if (workOrder.operations && workOrder.operations.length > 0) {
                doc.setFontSize(10);
                doc.text('Operations Sequence:', margin, yPos);
                yPos += 8;

                doc.setFontSize(9);
                workOrder.operations.forEach((op, idx) => {
                    const machine = op.assignedMachineName ? ` (${op.assignedMachineName})` : '';
                    doc.text(`${idx + 1}. ${op.operationType}${machine}`, margin + 5, yPos);
                    yPos += 5;
                });
            }

            yPos += 10;

            // Scan Instructions
            doc.setFontSize(10);
            doc.text('Scanning Instructions:', margin, yPos);
            yPos += 8;

            doc.setFontSize(9);
            const instructions = [
                '1. Scan barcode at start of each operation',
                '2. System will automatically track progress',
                '3. Scan when operation completes',
                '4. Report any scanning issues immediately',
                '5. Keep barcode labels clean and readable'
            ];

            instructions.forEach(instruction => {
                doc.text(instruction, margin + 5, yPos);
                yPos += 5;
            });

            doc.save(`${workOrder.workOrderNumber}_barcodes.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Print function
    const printBarcodes = () => {
        if (barcodeData.length === 0) return;

        const printWindow = window.open('', '_blank');
        const paperSize = pdfSettings.paperSize;
        const barcodesPerRow = pdfSettings.barcodesPerRow;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${workOrder.workOrderNumber} - Production Barcodes</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 10mm;
                        font-size: 9px;
                        background: white;
                    }
                    @page {
                        size: ${paperSize};
                        margin: 10mm;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 8mm;
                        padding-bottom: 2mm;
                        border-bottom: 2px solid #003366;
                    }
                    .unit-group {
                        margin-bottom: 8mm;
                        page-break-inside: avoid;
                    }
                    .unit-header {
                        font-weight: bold;
                        margin-bottom: 4mm;
                        background: #e6f2ff;
                        padding: 2mm 3mm;
                        font-size: 10px;
                        color: #003366;
                        border-left: 3px solid #003366;
                    }
                    .barcode-grid {
                        display: grid;
                        grid-template-columns: repeat(${barcodesPerRow}, 1fr);
                        gap: 3mm;
                    }
                    .barcode-item {
                        border: 1px solid #ccd9ff;
                        padding: 3mm;
                        text-align: center;
                        min-height: 35mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        background: #f9fbff;
                        border-radius: 2mm;
                    }
                    .barcode-image {
                        width: 100%;
                        height: 18mm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 2mm;
                        padding: 1mm;
                        background: white;
                        border: 1px solid #e0e0e0;
                    }
                    .barcode-id {
                        font-family: monospace;
                        font-size: 7px;
                        margin-bottom: 1mm;
                        word-break: break-all;
                        color: #666;
                    }
                    .barcode-info {
                        font-size: 8px;
                        line-height: 1.3;
                        width: 100%;
                    }
                    .op-name {
                        font-weight: bold;
                        color: #003366;
                        margin-bottom: 1mm;
                    }
                    .checksum {
                        font-family: monospace;
                        font-size: 7px;
                        color: #cc0000;
                        margin-top: 1mm;
                    }
                    .no-print {
                        display: none;
                    }
                    @media print {
                        body { margin: 8mm; }
                        .barcode-item { 
                            border: 0.5px solid #003366;
                            break-inside: avoid;
                        }
                        .unit-group {
                            break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 2mm; color: #003366;">PRODUCTION TRACKING BARCODES</div>
                    <div style="margin-bottom: 1mm; font-size: 11px;">Work Order: ${workOrder.workOrderNumber}</div>
                    <div style="margin-bottom: 1mm;">Product: ${workOrder.stockItemName} (${workOrder.stockItemReference})</div>
                    <div>Generated: ${new Date().toLocaleDateString()} | Units: ${workOrder.quantity} | Total Barcodes: ${barcodeData.length}</div>
                </div>
                
                <div id="barcodes-container">
                    ${(() => {
                // Group by unit
                const units = {};
                barcodeData.forEach(b => {
                    if (!units[b.unitNumber]) units[b.unitNumber] = [];
                    units[b.unitNumber].push(b);
                });

                let html = '';
                Object.keys(units).sort((a, b) => a - b).forEach(unitNumber => {
                    const unitBarcodes = units[unitNumber];
                    html += `
                                <div class="unit-group">
                                    <div class="unit-header">Unit ${unitNumber} - ${unitBarcodes.length} Operations</div>
                                    <div class="barcode-grid">
                                        ${unitBarcodes.map(barcode => `
                                            <div class="barcode-item">
                                                <div class="barcode-id">${barcode.baseId}</div>
                                                <div class="barcode-image">
                                                    <canvas id="canvas-${barcode.id}" width="160" height="45"></canvas>
                                                </div>
                                                <div class="barcode-info">
                                                    <div class="op-name">Op${barcode.opNumber}: ${barcode.opType}</div>
                                                    <div>${barcode.opMachine}</div>
                                                    <div class="checksum">Chk: ${barcode.checksum}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                });
                return html;
            })()}
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 10mm; padding-top: 3mm; border-top: 1px solid #ccc;">
                    <button onclick="window.print()" style="padding: 8px 20px; background: #003366; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; font-size: 12px;">
                        🖨️ Print Barcodes
                    </button>
                    <button onclick="window.close()" style="padding: 8px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        ✕ Close
                    </button>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        ${barcodeData.map(barcode => `
                            try {
                                JsBarcode("#canvas-${barcode.id}", "${barcode.id}", {
                                    format: "CODE128",
                                    width: 1.2,
                                    height: 35,
                                    displayValue: false,
                                    margin: 0,
                                    background: "#ffffff",
                                    lineColor: "#003366"
                                });
                            } catch (e) {
                                console.error("Error generating barcode for ${barcode.id}:", e);
                            }
                        `).join('')}
                    });
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const totalBarcodes = barcodeData.length;
    const exampleBarcode = barcodeData[0]?.id || `${workOrder.workOrderNumber}-001-01-XXXX`;

    return (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Generate Production Barcodes</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {workOrder?.workOrderNumber} • {totalBarcodes} tracking labels
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {/* Settings */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Paper Size
                                </label>
                                <select
                                    value={pdfSettings.paperSize}
                                    onChange={(e) => setPdfSettings({ ...pdfSettings, paperSize: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="A4">A4 (210 × 297 mm)</option>
                                    <option value="Letter">Letter (216 × 279 mm)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Barcodes per Row
                                </label>
                                <select
                                    value={pdfSettings.barcodesPerRow}
                                    onChange={(e) => setPdfSettings({ ...pdfSettings, barcodesPerRow: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>

                        {/* Info Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-md border border-blue-200">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-white p-2 rounded border border-blue-100">
                                    <div className="text-gray-600 text-xs">Units</div>
                                    <div className="font-bold text-blue-700">{workOrder?.quantity}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-blue-100">
                                    <div className="text-gray-600 text-xs">Operations</div>
                                    <div className="font-bold text-blue-700">{workOrder?.operations?.length || 0}</div>
                                </div>
                                <div className="col-span-2 bg-white p-2 rounded border border-blue-100">
                                    <div className="text-gray-600 text-xs">Total Barcodes</div>
                                    <div className="font-bold text-blue-700 text-lg">{totalBarcodes}</div>
                                </div>
                            </div>
                        </div>

                        {/* Barcode Format */}
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                            <div className="font-medium text-gray-700 mb-2 text-sm">Barcode Format:</div>
                            <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300">
                                [WorkOrderNumber]-[Unit3]-[Operation2]-[Checksum4]
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                <div className="mb-1"><span className="font-medium">Example:</span> {exampleBarcode}</div>
                                <div className="text-xs text-gray-500">
                                    ✓ Contains actual Work Order number for instant lookup
                                    ✓ Includes validation checksum
                                    ✓ Each barcode is unique to unit & operation
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={printBarcodes}
                                disabled={totalBarcodes === 0}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
                            <button
                                onClick={generatePDF}
                                disabled={loading || totalBarcodes === 0}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-md hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-3">
                            ✓ Professional barcode labels with validation ✓ Organized by unit ✓ Ready for production tracking
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeGenerator;