import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminImageUploaderProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
  optionalRemove?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  targetMaxBytes?: number;
  helperText?: string;
}

async function compressImageFile(
  file: File,
  maxWidth: number,
  maxHeight: number,
  targetMaxBytes: number
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً (الحد الأقصى 15 ميجابايت قبل الضغط).');
  }

  const imageBitmapOrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('تعذر قراءة الملف من الجهاز.'));
    reader.readAsDataURL(file);
  });

  const srcW = imageBitmapOrImg.naturalWidth || imageBitmapOrImg.width;
  const srcH = imageBitmapOrImg.naturalHeight || imageBitmapOrImg.height;
  if (!srcW || !srcH) {
    throw new Error('أبعاد الصورة غير صالحة.');
  }

  let scale = Math.min(1, maxWidth / srcW, maxHeight / srcH);
  let targetW = Math.max(1, Math.round(srcW * scale));
  let targetH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('المتصفح لا يدعم معالجة الصور.');
  }

  const drawResized = (w: number, h: number) => {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(imageBitmapOrImg, 0, 0, w, h);
  };

  drawResized(targetW, targetH);

  // Prefer WebP when supported, fallback to JPEG
  const testWebp = canvas.toDataURL('image/webp', 0.8);
  const mime = testWebp.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';

  const qualities = [0.85, 0.72, 0.58, 0.45];
  let result = '';

  for (const q of qualities) {
    result = canvas.toDataURL(mime, q);
    if (result.length <= targetMaxBytes) {
      return result;
    }
  }

  // If still above target size, shrink dimensions down once more
  targetW = Math.max(240, Math.round(targetW * 0.72));
  targetH = Math.max(180, Math.round(targetH * 0.72));
  drawResized(targetW, targetH);
  result = canvas.toDataURL(mime, 0.55);

  return result;
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  label,
  value,
  onChange,
  required = false,
  optionalRemove = true,
  maxWidth = 1000,
  maxHeight = 700,
  targetMaxBytes = 140000,
  helperText,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setProcessing(true);
    try {
      const optimizedDataUrl = await compressImageFile(file, maxWidth, maxHeight, targetMaxBytes);
      onChange(optimizedDataUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل معالجة الصورة.');
    } finally {
      setProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const approxKb = value?.startsWith('data:')
    ? Math.max(1, Math.round((value.length * 3) / 4 / 1024))
    : null;

  return (
    <div className="space-y-2">
      <label className="block font-semibold text-slate-700 text-xs">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-3 transition ${
          dragOver
            ? 'border-[#D4AF37] bg-amber-50/70'
            : 'border-[#D5CDBD] bg-[#FBF9F5]'
        }`}
      >
        {value ? (
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="relative w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-slate-900 border border-[#EAE4D9] shrink-0">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {approxKb !== null && (
                <span className="absolute bottom-1.5 start-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                  {approxKb} KB
                </span>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <p className="text-[11px] text-slate-600">
                {value.startsWith('data:')
                  ? 'تم رفع الصورة وضغطها بنجاح وجاهزة للحفظ.'
                  : 'الصورة الحالية معروضة في الموقع — يمكنك استبدالها برفع صورة من جهازك.'}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
                  <span>{processing ? 'جاري المعالجة...' : 'رفع صورة جديدة'}</span>
                </button>

                {optionalRemove && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setErrorMsg(null);
                      onChange('');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إزالة الصورة</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={processing}
            onClick={() => inputRef.current?.click()}
            className="w-full py-5 px-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-white/70 rounded-lg transition disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-[#0D1B2A] text-[#D4AF37] flex items-center justify-center shadow-xs">
              {processing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-[#0D1B2A] block">
                {processing ? 'جاري تجهيز وضغط الصورة...' : 'اضغط لرفع صورة من جهازك أو اسحب الصورة هنا'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
                <span>JPG, PNG, WebP — يتم التحسين تلقائياً للعرض السريع</span>
              </span>
            </div>
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {errorMsg && (
        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  );
};
