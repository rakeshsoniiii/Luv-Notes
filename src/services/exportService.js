import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

class ExportService {
  // Export note to PDF
  static async exportToPDF(note, theme = 'default') {
    try {
      // Create a temporary div to render the note content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';
      tempDiv.style.borderRadius = '8px';
      tempDiv.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      
      // Apply theme-specific styling
      if (theme === 'dark') {
        tempDiv.style.backgroundColor = '#1a1a2e';
        tempDiv.style.color = '#ffffff';
      }

      // Create the note content HTML
      tempDiv.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="color: #ff6b9d; margin: 0 0 20px 0; font-size: 28px; border-bottom: 2px solid #ff6b9d; padding-bottom: 10px;">
            ${note.title || 'Untitled Note'}
          </h1>
          <div style="color: #666; font-size: 14px; margin-bottom: 20px;">
            <strong>Created:</strong> ${new Date(note.createdAt || Date.now()).toLocaleString()}<br>
            <strong>Last Modified:</strong> ${new Date(note.updatedAt || Date.now()).toLocaleString()}
          </div>
        </div>
        <div style="line-height: 1.6; font-size: 16px;">
          ${note.content || ''}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center;">
          Exported from Luv Notes on ${new Date().toLocaleString()}
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `${note.title || 'Untitled'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export note to Word document
  static async exportToWord(note) {
    try {
      // Create Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: note.title || 'Untitled Note',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
                before: 400
              }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Created: ${new Date(note.createdAt || Date.now()).toLocaleString()}`,
                  size: 20,
                  color: '666666'
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Last Modified: ${new Date(note.updatedAt || Date.now()).toLocaleString()}`,
                  size: 20,
                  color: '666666'
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: this.stripHtmlTags(note.content || ''),
                  size: 24,
                  break: 1
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Exported from Luv Notes on ${new Date().toLocaleString()}`,
                  size: 18,
                  color: '999999',
                  italics: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 800 }
            })
          ]
        }]
      });

      // Generate and save document
      const buffer = await Packer.toBuffer(doc);
      const fileName = `${note.title || 'Untitled'}_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(new Blob([buffer]), fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Word export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export multiple notes to a single document
  static async exportMultipleNotes(notes, format = 'pdf', theme = 'default') {
    if (format === 'pdf') {
      return this.exportMultipleToPDF(notes, theme);
    } else {
      return this.exportMultipleToWord(notes);
    }
  }

  // Export multiple notes to PDF
  static async exportMultipleToPDF(notes, theme = 'default') {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let currentPage = 0;

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        
        if (i > 0) {
          pdf.addPage();
          currentPage++;
        }

        // Create temporary div for each note
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.style.padding = '40px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.backgroundColor = theme === 'dark' ? '#1a1a2e' : '#ffffff';
        tempDiv.style.color = theme === 'dark' ? '#ffffff' : '#000000';

        tempDiv.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h2 style="color: #ff6b9d; margin: 0 0 15px 0; font-size: 24px; border-bottom: 2px solid #ff6b9d; padding-bottom: 8px;">
              ${note.title || 'Untitled Note'}
            </h2>
            <div style="color: #666; font-size: 12px; margin-bottom: 15px;">
              <strong>Created:</strong> ${new Date(note.createdAt || Date.now()).toLocaleString()}<br>
              <strong>Last Modified:</strong> ${new Date(note.updatedAt || Date.now()).toLocaleString()}
            </div>
          </div>
          <div style="line-height: 1.5; font-size: 14px;">
            ${note.content || ''}
          </div>
        `;

        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff'
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add first page for this note
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if note content is too long
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          currentPage++;
        }
      }

      // Save PDF
      const fileName = `LuvNotes_Export_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      return { success: true, fileName, noteCount: notes.length };
    } catch (error) {
      console.error('Multiple PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export multiple notes to Word
  static async exportMultipleToWord(notes) {
    try {
      const children = [];

      // Add title
      children.push(
        new Paragraph({
          text: 'Luv Notes Export',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400, before: 400 }
        })
      );

      // Add export info
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported ${notes.length} notes on ${new Date().toLocaleString()}`,
              size: 20,
              color: '666666'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        })
      );

      // Add each note
      notes.forEach((note, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${note.title || 'Untitled Note'}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200, before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created: ${new Date(note.createdAt || Date.now()).toLocaleString()}`,
                size: 18,
                color: '666666'
              })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Last Modified: ${new Date(note.updatedAt || Date.now()).toLocaleString()}`,
                size: 18,
                color: '666666'
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: this.stripHtmlTags(note.content || ''),
                size: 20,
                break: 1
              })
            ],
            spacing: { after: 400 }
          })
        );

        // Add separator between notes (except for last note)
        if (index < notes.length - 1) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '─'.repeat(50),
                  size: 20,
                  color: 'cccccc'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
          );
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      const fileName = `LuvNotes_Export_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(new Blob([buffer]), fileName);

      return { success: true, fileName, noteCount: notes.length };
    } catch (error) {
      console.error('Multiple Word export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to strip HTML tags
  static stripHtmlTags(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

export default ExportService;
