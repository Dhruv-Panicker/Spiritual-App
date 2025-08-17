
import { Platform } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '../constants/SpiritualColors';

interface Quote {
  id: string;
  text: string;
  author: string;
  reflection?: string;
}

interface ShareImageOptions {
  quote: Quote;
  includeReflection?: boolean;
  theme?: 'light' | 'dark' | 'gradient';
}

class ImageGenerationService {
  private canvasWidth = 1080;
  private canvasHeight = 1080;

  async generateQuoteImage(options: ShareImageOptions): Promise<string> {
    const { quote, includeReflection = false, theme = 'gradient' } = options;

    if (Platform.OS === 'web') {
      return this.generateWebImage(quote, includeReflection, theme);
    } else {
      // For mobile, we'll return a data URL that can be shared
      return this.generateMobileImageData(quote, includeReflection, theme);
    }
  }

  private generateWebImage(quote: Quote, includeReflection: boolean, theme: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
    
    if (theme === 'gradient') {
      gradient.addColorStop(0, SPIRITUAL_COLORS.primary);
      gradient.addColorStop(0.5, SPIRITUAL_COLORS.secondary);
      gradient.addColorStop(1, '#8B5CF6');
    } else if (theme === 'dark') {
      gradient.addColorStop(0, '#1F2937');
      gradient.addColorStop(1, '#374151');
    } else {
      gradient.addColorStop(0, '#FEF7ED');
      gradient.addColorStop(1, '#FED7AA');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Add subtle pattern overlay
    this.addPatternOverlay(ctx);

    // Add Om symbol watermark
    this.addOmSymbol(ctx);

    // Add quote text
    this.addQuoteText(ctx, quote.text, quote.author);

    // Add reflection if included
    if (includeReflection && quote.reflection) {
      this.addReflectionText(ctx, quote.reflection);
    }

    // Add app branding
    this.addAppBranding(ctx);

    return canvas.toDataURL('image/png', 0.9);
  }

  private generateMobileImageData(quote: Quote, includeReflection: boolean, theme: string): string {
    // For mobile, we'll create an SVG data URL that can be shared
    const svgContent = this.generateSVGQuoteImage(quote, includeReflection, theme);
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }

  private generateSVGQuoteImage(quote: Quote, includeReflection: boolean, theme: string): string {
    const gradientColors = theme === 'gradient' 
      ? [SPIRITUAL_COLORS.primary, SPIRITUAL_COLORS.secondary, '#8B5CF6']
      : theme === 'dark' 
      ? ['#1F2937', '#374151']
      : ['#FEF7ED', '#FED7AA'];

    return `
      <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradientColors[0]}" />
            <stop offset="50%" style="stop-color:${gradientColors[1]}" />
            <stop offset="100%" style="stop-color:${gradientColors[2] || gradientColors[1]}" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1080" height="1080" fill="url(#bg)" />
        
        <!-- Pattern overlay -->
        <pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="40">
          <circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/>
        </pattern>
        <rect width="1080" height="1080" fill="url(#pattern)" />
        
        <!-- Om Symbol Watermark -->
        <text x="940" y="140" font-family="serif" font-size="80" fill="white" opacity="0.2">🕉</text>
        
        <!-- Quote Container -->
        <rect x="80" y="300" width="920" height="400" rx="20" fill="white" opacity="0.95" filter="url(#shadow)"/>
        
        <!-- Quote Text -->
        <text x="540" y="420" text-anchor="middle" font-family="serif" font-size="36" font-weight="300" fill="#2D1810">
          <tspan x="540" dy="0">"${this.wrapText(quote.text, 25)[0]}"</tspan>
          ${this.wrapText(quote.text, 25).slice(1).map((line, i) => 
            `<tspan x="540" dy="45">${line}</tspan>`
          ).join('')}
        </text>
        
        <!-- Author -->
        <text x="540" y="${520 + (this.wrapText(quote.text, 25).length - 1) * 45}" text-anchor="middle" 
              font-family="serif" font-size="24" font-weight="600" fill="${SPIRITUAL_COLORS.primary}">
          — ${quote.author}
        </text>
        
        ${includeReflection && quote.reflection ? `
        <!-- Reflection -->
        <rect x="120" y="780" width="840" height="120" rx="10" fill="${SPIRITUAL_COLORS.accent}" opacity="0.8"/>
        <text x="540" y="820" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#2D1810">
          <tspan x="540" dy="0">Reflection: ${this.wrapText(quote.reflection, 50)[0]}</tspan>
          ${this.wrapText(quote.reflection, 50).slice(1).map((line, i) => 
            `<tspan x="540" dy="22">${line}</tspan>`
          ).join('')}
        </text>` : ''}
        
        <!-- App Branding -->
        <text x="540" y="980" text-anchor="middle" font-family="serif" font-size="20" font-weight="600" fill="white">
          Spiritual Wisdom App 🙏
        </text>
      </svg>
    `;
  }

  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  private addPatternOverlay(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let x = 0; x < this.canvasWidth; x += 40) {
      for (let y = 0; y < this.canvasHeight; y += 40) {
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  private addOmSymbol(ctx: CanvasRenderingContext2D) {
    ctx.font = '80px serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillText('🕉', this.canvasWidth - 140, 140);
  }

  private addQuoteText(ctx: CanvasRenderingContext2D, text: string, author: string) {
    // Quote container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    this.roundRect(ctx, 80, 300, 920, 400, 20);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Quote text
    ctx.fillStyle = '#2D1810';
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    
    const maxWidth = 840;
    const lineHeight = 45;
    const lines = this.wrapTextCanvas(ctx, `"${text}"`, maxWidth);
    
    let y = 420;
    lines.forEach((line, index) => {
      ctx.fillText(line, this.canvasWidth / 2, y + (index * lineHeight));
    });

    // Author
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = SPIRITUAL_COLORS.primary;
    ctx.fillText(`— ${author}`, this.canvasWidth / 2, y + (lines.length * lineHeight) + 40);
  }

  private addReflectionText(ctx: CanvasRenderingContext2D, reflection: string) {
    ctx.fillStyle = SPIRITUAL_COLORS.accent + '80';
    this.roundRect(ctx, 120, 780, 840, 120, 10);
    ctx.fill();

    ctx.fillStyle = '#2D1810';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    
    const maxWidth = 800;
    const lines = this.wrapTextCanvas(ctx, `Reflection: ${reflection}`, maxWidth);
    
    let y = 820;
    lines.forEach((line, index) => {
      ctx.fillText(line, this.canvasWidth / 2, y + (index * 22));
    });
  }

  private addAppBranding(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Spiritual Wisdom App 🙏', this.canvasWidth / 2, 980);
  }

  private wrapTextCanvas(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

export const imageGenerationService = new ImageGenerationService();
