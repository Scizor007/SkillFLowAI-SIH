import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CounselingSummary {
  student_summary: string;
  parent_summary: string;
  combined_recommendation: string;
  career_paths: Array<{
    id: string;
    title: string;
    description: string;
    next_steps: string[];
  }>;
}

const DEFAULT_PROMPT = `You are an academic and career counselor. Given separate raw text inputs from a STUDENT and a PARENT about the student's interests, strengths, concerns, and goals:
Return STRICT JSON with keys: student_summary, parent_summary, combined_recommendation, career_paths.
career_paths is an array of 2-4 objects with: id (kebab-case), title, description, next_steps (array of concise action items).
Keep responses encouraging, specific, and actionable.
NO markdown. NO extra commentary.`;

const ParentsCounseling: React.FC = () => {
  const [studentInput, setStudentInput] = useState('');
  const [parentInput, setParentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CounselingSummary | null>(null);

  const extractJson = (raw: string): unknown => {
    // Strip code fences if present
    let text = raw.trim();
    text = text.replace(/^```json\s*([\s\S]*?)\s*```$/i, '$1').trim();
    text = text.replace(/^```\s*([\s\S]*?)\s*```$/i, '$1').trim();
    // Try direct parse
  try { return JSON.parse(text); } catch (e) { /* continue */ }
    // Fallback: slice between first '{' and last '}'
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
  try { return JSON.parse(candidate); } catch (e) { /* continue */ }
    }
    // Another fallback: find any json object-ish with braces greedily
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
  try { return JSON.parse(match[0]); } catch (e) { /* continue */ }
    }
    throw new Error('Failed to parse AI response as JSON');
  };

  const handleGenerate = useCallback(async () => {
    if (!studentInput.trim() || !parentInput.trim()) {
      toast.error('Please provide both student and parent inputs.');
      return;
    }
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    if (!apiKey) {
      toast.error('Missing Gemini API key.');
      return;
    }

    setLoading(true);
    setData(null);
    try {
      const prompt = `${DEFAULT_PROMPT}\n\nSTUDENT INPUT:\n${studentInput}\n\nPARENT INPUT:\n${parentInput}`;
      const res = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 1024, responseMimeType: 'application/json' },
        }),
      });

      if (!res.ok) throw new Error('Network response not ok');
  const json = await res.json();
  const parts: Array<{ text?: string }> = json?.candidates?.[0]?.content?.parts ?? [];
  const text: string = parts.map(p => p.text).filter(Boolean).join('\n');
  if (!text) throw new Error('Empty model response');

      const parsedUnknown = extractJson(text);
      const parsed = parsedUnknown as Partial<CounselingSummary>;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      if (!parsed.student_summary || !parsed.parent_summary || !parsed.career_paths) {
        throw new Error('Incomplete JSON shape');
      }
      setData(parsed as CounselingSummary);
      toast.success('Counseling plan generated');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [studentInput, parentInput]);

  const buildFlow = (): { nodes: Node[]; edges: Edge[] } => {
    if (!data) return { nodes: [], edges: [] };
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    nodes.push({ id: 'start', data: { label: 'Student Profile' }, position: { x: 50, y: 50 }, sourcePosition: Position.Right, style: { background: '#6366f1', color: '#fff' } });

    data.career_paths.forEach((p, i) => {
      const baseY = 50 + i * 160;
      const pathNodeId = `path-${p.id}`;
      nodes.push({ id: pathNodeId, data: { label: p.title }, position: { x: 300, y: baseY }, targetPosition: Position.Left, sourcePosition: Position.Right, style: { background: '#1e293b', color: '#f1f5f9' } });
      edges.push({ id: `e-start-${pathNodeId}`, source: 'start', target: pathNodeId, animated: true });

      p.next_steps.slice(0, 3).forEach((step, si) => {
        const stepId = `${pathNodeId}-step-${si}`;
        nodes.push({ id: stepId, data: { label: step }, position: { x: 600, y: baseY + si * 60 }, targetPosition: Position.Left, style: { background: '#0f172a', color: '#e2e8f0', fontSize: 12, padding: 4 } });
        edges.push({ id: `e-${pathNodeId}-${stepId}`, source: pathNodeId, target: stepId });
      });
    });

    return { nodes, edges };
  };

  const { nodes, edges } = buildFlow();

  return (
    <div className="container mx-auto max-w-6xl py-28 space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Perspective</CardTitle>
            <CardDescription>Interests, subjects liked, achievements, struggles</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={studentInput}
              onChange={e => setStudentInput(e.target.value)}
              placeholder="I enjoy math and coding, I'm unsure about design, I like solving puzzles..."
              className="min-h-48"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Parent Perspective</CardTitle>
            <CardDescription>Observations, aspirations, concerns, support level</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={parentInput}
              onChange={e => setParentInput(e.target.value)}
              placeholder="My child spends time building small apps, wants guidance on future paths..."
              className="min-h-48"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Counseling Plan'}
        </Button>
        <Button variant="outline" onClick={() => { setStudentInput(''); setParentInput(''); setData(null); }} disabled={loading}>Reset</Button>
      </div>

      {data && (
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Summaries</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h4 className="font-semibold mb-1">Student Summary</h4>
                  <p>{data.student_summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Parent Summary</h4>
                  <p>{data.parent_summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Combined Recommendation</h4>
                  <p>{data.combined_recommendation}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Career Paths</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {data.career_paths.map(p => (
                  <div key={p.id} className="rounded-md border p-3 bg-card/50">
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                    <ul className="text-xs list-disc pl-4 space-y-1">
                      {p.next_steps.map((s,i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-3 h-[600px] rounded-lg border overflow-hidden">
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background gap={16} color="#444" />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentsCounseling;