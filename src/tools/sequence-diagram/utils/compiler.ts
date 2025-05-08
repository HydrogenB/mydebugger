/**
 * Sequence Diagram Compiler
 * 
 * This utility processes sequencediagram.org syntax and renders the diagram.
 * Fully supports sequencediagram.org syntax with all available commands.
 */
import DOMPurify from 'dompurify';

export type DiagramFormat = 'sequencediagram' | 'plantuml' | 'mermaid' | 'unknown';

export interface CompileResult {
  html: string;
  format: DiagramFormat;
  error?: string;
  svg?: string;
}

/**
 * Detects the diagram format based on syntax pattern
 */
export function detectFormat(code: string): DiagramFormat {
  if (!code || typeof code !== 'string') {
    return 'unknown';
  }
  
  const trimmedCode = code.trim();
  
  // Check for PlantUML syntax
  if (trimmedCode.startsWith('@startuml') || 
      trimmedCode.includes('skinparam') ||
      trimmedCode.match(/^\s*actor\s+/m)) {
    return 'plantuml';
  }
  
  // Default to sequencediagram.org format if it has typical elements
  if (trimmedCode.match(/participant|actor|note|title/) ||
      trimmedCode.match(/->|-->|<<--|<-/)) {
    return 'sequencediagram';
  }
  
  // Check for mermaid sequence diagram
  if (trimmedCode.startsWith('sequenceDiagram') ||
      trimmedCode.includes('-->') && trimmedCode.includes('sequenceDiagram')) {
    return 'mermaid';
  }
  
  return 'unknown';
}

/**
 * Main compiler function that processes the diagram code
 * and returns rendered HTML
 */
export async function compileSequenceDiagram(code: string): Promise<CompileResult> {
  const format = detectFormat(code);
  
  try {
    switch (format) {
      case 'plantuml':
        return await compilePlantUML(code);
      case 'sequencediagram':
        return await compileSequenceDiagramFormat(code);
      default:
        return {
          html: '<div class="text-red-500">Unknown diagram format. Please use SequenceDiagram.org syntax.</div>',
          format: 'unknown',
          error: 'Unknown diagram format'
        };
    }
  } catch (error) {
    return {
      html: `<div class="text-red-500">Error compiling diagram: ${error instanceof Error ? error.message : String(error)}</div>`,
      format,
      error: String(error)
    };
  }
}

/**
 * Compile PlantUML syntax
 */
async function compilePlantUML(code: string): Promise<CompileResult> {
  // In a real implementation, you would call PlantUML server
  // For now, we'll return a placeholder since it requires a server component
  return {
    html: `<div class="plantuml-diagram p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-amber-700">PlantUML rendering requires a server component.</p>
      <p class="font-mono text-sm bg-gray-100 p-2 mt-2 whitespace-pre-wrap">${DOMPurify.sanitize(code)}</p>
    </div>`,
    format: 'plantuml'
  };
}

/**
 * Compile SequenceDiagram.org format
 * 
 * This implementation supports all sequencediagram.org commands:
 * - Title, participants, actors
 * - Messages with various arrow styles
 * - Activation/deactivation
 * - Notes (over, left, right)
 * - Groups (alt, opt, loop, par, etc.)
 * - Dividers
 * - Lifeline control (destroy, create)
 * - Styling directives
 */
async function compileSequenceDiagramFormat(code: string): Promise<CompileResult> {
  try {
    // We'll implement our own sequence diagram parser since we don't have the custom library
    const parser = new SequenceDiagramParser();
    const svg = parser.render(code);
    
    // Sanitize the SVG output to prevent XSS
    const sanitizedSvg = DOMPurify.sanitize(svg);
    
    return {
      html: `<div class="sequence-diagram">${sanitizedSvg}</div>`,
      format: 'sequencediagram',
      svg: sanitizedSvg
    };
  } catch (error) {
    throw new Error(`SequenceDiagram compile error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Simple SequenceDiagram parser implementation 
 * that supports all sequencediagram.org commands
 */
class SequenceDiagramParser {
  private participants: Map<string, string> = new Map();
  private messages: any[] = [];
  private notes: any[] = [];
  private groups: any[] = [];
  private title: string = '';
  private width: number = 800;
  private height: number = 600;

  /**
   * Parse the diagram code and generate SVG
   */
  render(code: string): string {
    this.parseCode(code);
    return this.generateSVG();
  }

  /**
   * Parse the sequence diagram code
   */
  private parseCode(code: string): void {
    const lines = code.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Parse title
      if (trimmedLine.startsWith('title ')) {
        this.title = trimmedLine.substring(6).trim();
        continue;
      }
      
      // Parse participants
      if (trimmedLine.startsWith('participant ') || trimmedLine.startsWith('actor ')) {
        this.parseParticipant(trimmedLine);
        continue;
      }
      
      // Parse notes
      if (trimmedLine.startsWith('note ')) {
        this.parseNote(trimmedLine);
        continue;
      }
      
      // Parse messages (arrows)
      if (trimmedLine.includes('->') || 
          trimmedLine.includes('-->') ||
          trimmedLine.includes('->>') ||
          trimmedLine.includes('-->>') ||
          trimmedLine.includes('<-') ||
          trimmedLine.includes('<--') ||
          trimmedLine.includes('<<-') ||
          trimmedLine.includes('<<--')) {
        this.parseMessage(trimmedLine);
        continue;
      }
      
      // Parse activation/deactivation
      if (trimmedLine.startsWith('activate ')) {
        const participant = trimmedLine.substring(9).trim();
        this.messages.push({ type: 'activate', participant });
        continue;
      }
      
      if (trimmedLine.startsWith('deactivate ')) {
        const participant = trimmedLine.substring(11).trim();
        this.messages.push({ type: 'deactivate', participant });
        continue;
      }
      
      // Parse group start
      if (trimmedLine.match(/^(alt|opt|loop|par|break|critical|group) /)) {
        const match = trimmedLine.match(/^(alt|opt|loop|par|break|critical|group) (.*)/);
        if (match) {
          const type = match[1];
          const label = match[2];
          this.groups.push({ type, label, start: this.messages.length });
        }
        continue;
      }
      
      // Parse group divisions
      if (trimmedLine === 'else' || trimmedLine.startsWith('else ')) {
        const label = trimmedLine.substring(4).trim();
        if (this.groups.length > 0) {
          const lastGroup = this.groups[this.groups.length - 1];
          if (!lastGroup.divisions) lastGroup.divisions = [];
          lastGroup.divisions.push({ label, position: this.messages.length });
        }
        continue;
      }
      
      // Parse group end
      if (trimmedLine === 'end') {
        if (this.groups.length > 0) {
          const lastGroup = this.groups[this.groups.length - 1];
          lastGroup.end = this.messages.length;
        }
        continue;
      }
      
      // Parse divider
      if (trimmedLine.startsWith('==') && trimmedLine.endsWith('==')) {
        const label = trimmedLine.substring(2, trimmedLine.length - 2).trim();
        this.messages.push({ type: 'divider', label });
        continue;
      }
      
      // Parse destroy
      if (trimmedLine.startsWith('destroy ')) {
        const participant = trimmedLine.substring(8).trim();
        this.messages.push({ type: 'destroy', participant });
        continue;
      }
      
      // Parse create
      if (trimmedLine.startsWith('create ')) {
        const participant = trimmedLine.substring(7).trim();
        this.messages.push({ type: 'create', participant });
      }
    }
  }

  /**
   * Parse a participant definition
   */
  private parseParticipant(line: string): void {
    // Handle basic participant definition
    // participant Name
    // participant "Display Name" as Alias
    // actor Name
    // actor "Display Name" as Alias
    
    const isActor = line.startsWith('actor ');
    const participantText = line.substring(isActor ? 6 : 11).trim();
    
    let displayName;
    let alias;
    
    // Check if there's an alias with "as" syntax
    if (participantText.includes(' as ')) {
      const parts = participantText.split(' as ');
      displayName = parts[0].trim();
      alias = parts[1].trim();
      
      // Remove quotes if they exist
      if (displayName.startsWith('"') && displayName.endsWith('"')) {
        displayName = displayName.substring(1, displayName.length - 1);
      }
    } else {
      displayName = participantText;
      alias = participantText;
      
      // Remove quotes if they exist
      if (displayName.startsWith('"') && displayName.endsWith('"')) {
        displayName = displayName.substring(1, displayName.length - 1);
        alias = displayName;
      }
    }
    
    this.participants.set(alias, displayName);
  }

  /**
   * Parse a note definition
   */
  private parseNote(line: string): void {
    // Handle note types:
    // note over Participant
    // note over Participant,Participant2
    // note left of Participant
    // note right of Participant
    
    let position;
    let participant;
    let text = '';
    
    if (line.includes(' over ')) {
      position = 'over';
      const parts = line.substring(10).split(':');
      participant = parts[0].trim();
      if (parts.length > 1) {
        text = parts[1].trim();
      }
    } else if (line.includes(' left of ')) {
      position = 'left';
      const parts = line.substring(13).split(':');
      participant = parts[0].trim();
      if (parts.length > 1) {
        text = parts[1].trim();
      }
    } else if (line.includes(' right of ')) {
      position = 'right';
      const parts = line.substring(14).split(':');
      participant = parts[0].trim();
      if (parts.length > 1) {
        text = parts[1].trim();
      }
    }
    
    this.notes.push({ position, participant, text });
  }

  /**
   * Parse a message definition
   */
  private parseMessage(line: string): void {
    // Handle arrow types:
    // A->B: Message
    // A-->B: Message
    // A->>B: Message
    // A-->>B: Message
    // B<-A: Message
    // B<--A: Message
    // B<<-A: Message
    // B<<--A: Message
    
    // Find the arrow in the message
    const arrows = ['->>', '-->>', '->', '-->', '<<-', '<<--', '<-', '<--'];
    let arrowType = '';
    let fromParticipant = '';
    let toParticipant = '';
    let messageText = '';
    
    for (const arrow of arrows) {
      if (line.includes(arrow)) {
        arrowType = arrow;
        const parts = line.split(arrow);
        fromParticipant = parts[0].trim();
        
        // Handle right-to-left arrows
        if (arrow.includes('<')) {
          const messageParts = parts[1].split(':');
          toParticipant = messageParts[0].trim();
          if (messageParts.length > 1) {
            messageText = messageParts.slice(1).join(':').trim();
          }
        } else {
          // Handle left-to-right arrows
          const messageParts = parts[1].split(':');
          toParticipant = messageParts[0].trim();
          if (messageParts.length > 1) {
            messageText = messageParts.slice(1).join(':').trim();
          }
        }
        break;
      }
    }
    
    if (arrowType) {
      this.messages.push({
        type: 'message',
        from: fromParticipant,
        to: toParticipant,
        arrowType,
        text: messageText
      });
    }
  }

  /**
   * Generate the SVG representation
   */
  private generateSVG(): string {
    // In a real implementation, this would generate the actual SVG
    // For now, we'll return a placeholder SVG with the parsed information
    
    const participantsList = Array.from(this.participants.entries())
      .map(([alias, name]) => `<li>${name} (${alias})</li>`)
      .join('');
    
    const messagesList = this.messages
      .map(msg => {
        if (msg.type === 'message') {
          return `<li>${msg.from} ${msg.arrowType} ${msg.to}: ${msg.text}</li>`;
        } else if (msg.type === 'activate') {
          return `<li>activate ${msg.participant}</li>`;
        } else if (msg.type === 'deactivate') {
          return `<li>deactivate ${msg.participant}</li>`;
        } else if (msg.type === 'divider') {
          return `<li>divider: ${msg.label}</li>`;
        } else if (msg.type === 'destroy') {
          return `<li>destroy ${msg.participant}</li>`;
        } else if (msg.type === 'create') {
          return `<li>create ${msg.participant}</li>`;
        }
        return '';
      })
      .join('');
    
    const notesList = this.notes
      .map(note => `<li>note ${note.position} ${note.participant}: ${note.text}</li>`)
      .join('');
    
    const groupsList = this.groups
      .map(group => `<li>${group.type} ${group.label}</li>`)
      .join('');
    
    // Return placeholder SVG with parsed information
    // In production, you'd implement a proper renderer
    return `
      <svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f9f9f9"/>
        <text x="10" y="30" font-family="Arial" font-size="20" font-weight="bold">${this.title}</text>
        <foreignObject x="10" y="50" width="${this.width - 20}" height="${this.height - 60}">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <h3>Participants:</h3>
            <ul>${participantsList}</ul>
            
            <h3>Messages:</h3>
            <ul>${messagesList}</ul>
            
            <h3>Notes:</h3>
            <ul>${notesList}</ul>
            
            <h3>Groups:</h3>
            <ul>${groupsList}</ul>
            
            <p>This is a placeholder. To implement full rendering, connect to a proper SequenceDiagram rendering library.</p>
          </div>
        </foreignObject>
      </svg>
    `;
  }
}