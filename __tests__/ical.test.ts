import { generateICalEvent } from '../model/ical';

describe('generateICalEvent', () => {
  it('builds VEVENT with timezone and alarm', () => {
    const event = {
      summary: 'Team Meeting',
      location: 'Room 5B',
      description: 'Discuss Q3',
      start: '2025-07-01T14:00',
      end: '2025-07-01T15:00',
      timezone: 'Asia/Bangkok',
      uid: '123@example.com',
      alarmMinutes: 15,
    };

    const result = generateICalEvent(event);

    expect(result.split('\n')).toEqual([
      'BEGIN:VEVENT',
      'SUMMARY:Team Meeting',
      'LOCATION:Room 5B',
      'DESCRIPTION:Discuss Q3',
      'DTSTART:20250701T070000Z',
      'DTEND:20250701T080000Z',
      'UID:123@example.com',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
    ]);
  });
});
