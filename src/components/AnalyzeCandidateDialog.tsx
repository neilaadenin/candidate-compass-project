import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText } from "lucide-react";

interface AnalyzeCandidateDialogProps {
  candidateId: string;
  candidateName: string;
  onAnalysisComplete: () => void;
}

export function AnalyzeCandidateDialog({ 
  candidateId, 
  candidateName,
  onAnalysisComplete 
}: AnalyzeCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobRequirements, setJobRequirements] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Simple text extraction - looking for text between stream objects
          const decoder = new TextDecoder('utf-8');
          let text = decoder.decode(uint8Array);
          
          // Extract text content from PDF (basic extraction)
          const textRegex = /BT\s*(.*?)\s*ET/gs;
          const matches = text.match(textRegex);
          
          if (matches) {
            const extractedText = matches
              .map(match => match.replace(/BT|ET|Tj|TJ|'|"|Td|TD|Tm|T\*/g, ''))
              .join(' ')
              .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
              .trim();
            
            resolve(extractedText || "Unable to extract text from PDF. Please try another file.");
          } else {
            resolve("Unable to extract text from PDF. Please try another file.");
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!cvFile || !jobRequirements.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload a CV and enter job requirements",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Extract text from PDF
      const cvText = await extractTextFromPDF(cvFile);
      
      if (cvText.includes("Unable to extract")) {
        toast({
          title: "PDF extraction failed",
          description: cvText,
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Call edge function to analyze CV
      const { data, error } = await supabase.functions.invoke('analyze-cv', {
        body: {
          candidateId,
          cvText,
          jobRequirements: jobRequirements.trim(),
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Analysis complete",
        description: `Match percentage: ${data.matchPercentage}%`,
      });

      onAnalysisComplete();
      setOpen(false);
      setCvFile(null);
      setJobRequirements("");
      
    } catch (error) {
      console.error("Error analyzing candidate:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze candidate",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Analisis Kandidat: {candidateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cv-upload">Upload CV (PDF)</Label>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {cvFile && (
              <p className="text-sm text-muted-foreground">
                File selected: {cvFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-requirements">Kualifikasi Pekerjaan</Label>
            <Textarea
              id="job-requirements"
              placeholder="Masukkan kualifikasi pekerjaan yang dibutuhkan..."
              value={jobRequirements}
              onChange={(e) => setJobRequirements(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !cvFile || !jobRequirements.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menganalisis...
              </>
            ) : (
              "Analisis Sekarang"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}