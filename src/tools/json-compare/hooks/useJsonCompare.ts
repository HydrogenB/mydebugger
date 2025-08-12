import { useCallback, useMemo, useState } from 'react';
import { compareJson, createSamplePair, formatJsonIfValid, makeDownload } from '../lib/jsonCompare';
import type { DiffReport } from '../lib/jsonCompare';

export interface UseJsonCompareVM {
  leftText: string;
  rightText: string;
  setLeftText: (v: string) => void;
  setRightText: (v: string) => void;
  leftError: string | null;
  rightError: string | null;
  summary: DiffReport['summary'];
  onCompare: () => void;
  onFormat: () => void;
  onClear: () => void;
  onExport: () => void;
  onUploadLeft: (file: File) => Promise<void>;
  onUploadRight: (file: File) => Promise<void>;
  onLoadSample: () => void;
}

const useJsonCompare = (): UseJsonCompareVM => {
  const [leftText, setLeftText] = useState<string>('');
  const [rightText, setRightText] = useState<string>('');
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [report, setReport] = useState<DiffReport | null>(null);

  const summary = useMemo(() => ({
    added: report?.summary.added ?? 0,
    removed: report?.summary.removed ?? 0,
    modified: report?.summary.modified ?? 0,
  }), [report]);

  const parseSide = useCallback((text: string, setErr: (v: string | null) => void) => {
    try {
      setErr(null);
      return JSON.parse(text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setErr(msg);
      return undefined;
    }
  }, []);

  const onCompare = useCallback(() => {
    const leftObj = parseSide(leftText, setLeftError);
    const rightObj = parseSide(rightText, setRightError);
    if (leftObj === undefined || rightObj === undefined) return;
    setReport(compareJson(leftObj, rightObj));
  }, [leftText, rightText, parseSide]);

  const onFormat = useCallback(() => {
    const { formatted: l, error: le } = formatJsonIfValid(leftText);
    const { formatted: r, error: re } = formatJsonIfValid(rightText);
    setLeftText(l);
    setRightText(r);
    setLeftError(le);
    setRightError(re);
  }, [leftText, rightText]);

  const onClear = useCallback(() => {
    setLeftText('');
    setRightText('');
    setLeftError(null);
    setRightError(null);
    setReport(null);
  }, []);

  const onExport = useCallback(() => {
    const data = report ?? { summary: { added: 0, removed: 0, modified: 0 }, changes: [] };
    makeDownload('json-compare-diff.json', JSON.stringify(data, null, 2));
  }, [report]);

  const readFile = useCallback(async (file: File) => {
    const text = await file.text();
    return text;
  }, []);

  const onUploadLeft = useCallback(async (file: File) => {
    setLeftText(await readFile(file));
  }, [readFile]);

  const onUploadRight = useCallback(async (file: File) => {
    setRightText(await readFile(file));
  }, [readFile]);

  const onLoadSample = useCallback(() => {
    const { left, right } = createSamplePair();
    setLeftText(JSON.stringify(left, null, 2));
    setRightText(JSON.stringify(right, null, 2));
    setLeftError(null);
    setRightError(null);
    setReport(null);
  }, []);

  return {
    leftText,
    rightText,
    setLeftText,
    setRightText,
    leftError,
    rightError,
    summary,
    onCompare,
    onFormat,
    onClear,
    onExport,
    onUploadLeft,
    onUploadRight,
    onLoadSample,
  };
};

export default useJsonCompare;


