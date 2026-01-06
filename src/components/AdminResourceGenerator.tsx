import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Eye, Download, Upload, BookOpen, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Exercise {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Lesson {
  title: string;
  content: string;
  examples: string[];
  exercises: Exercise[];
}

interface ResourceConfig {
  title: string;
  subject: string;
  level: string;
  themeColor: string;
  gradientColor: string;
  lessons: Lesson[];
}

const SUBJECTS = [
  { value: 'francais', label: 'Français', color: '#56ab2f', gradient: '#a8e063' },
  { value: 'mathematiques', label: 'Mathématiques', color: '#3498db', gradient: '#74b9ff' },
  { value: 'sciences', label: 'Sciences', color: '#e67e22', gradient: '#f39c12' },
  { value: 'histoire-geo', label: 'Histoire-Géographie', color: '#8b4513', gradient: '#deb887' },
  { value: 'anglais', label: 'Anglais', color: '#e74c3c', gradient: '#fd79a8' },
  { value: 'philosophie', label: 'Philosophie', color: '#9b59b6', gradient: '#a29bfe' },
];

const LEVELS = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6ème', '5ème', '4ème', '3ème',
  'Seconde', 'Première', 'Terminale'
];

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const generateHTML = (config: ResourceConfig): string => {
  const { title, subject, level, themeColor, gradientColor, lessons } = config;
  
  const lessonsHTML = lessons.map((lesson, index) => {
    const exercisesHTML = lesson.exercises.map((ex, exIndex) => `
      <div class="exercise" data-correct="${ex.correctIndex}">
        <p class="exercise-question">${exIndex + 1}. ${ex.question}</p>
        <div class="options">
          ${ex.options.map((opt, optIndex) => `
            <label class="option">
              <input type="radio" name="q${index}_${exIndex}" value="${optIndex}">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
        <div class="feedback" style="display: none;">
          <p class="explanation">${ex.explanation}</p>
        </div>
      </div>
    `).join('');

    const examplesHTML = lesson.examples.length > 0 ? `
      <div class="examples-box">
        <h4>📝 Exemples</h4>
        <ul>
          ${lesson.examples.map(ex => `<li>${ex}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    return `
      <section class="lesson" id="lesson-${index + 1}" ${index > 0 ? 'style="display: none;"' : ''}>
        <div class="lesson-header">
          <span class="lesson-number">Leçon ${index + 1}</span>
          <h2>${lesson.title}</h2>
        </div>
        <div class="lesson-content">
          ${lesson.content}
          ${examplesHTML}
        </div>
        <div class="exercises-section">
          <h3>🎯 Exercices</h3>
          ${exercisesHTML}
          <button class="btn-validate" onclick="validateLesson(${index})">Valider mes réponses</button>
        </div>
        <div class="lesson-navigation">
          ${index > 0 ? `<button class="btn-nav" onclick="goToLesson(${index - 1})">← Leçon précédente</button>` : '<span></span>'}
          ${index < lessons.length - 1 ? `<button class="btn-nav btn-next" onclick="goToLesson(${index + 1})">Leçon suivante →</button>` : '<button class="btn-certificate" onclick="showCertificate()">🏆 Obtenir mon certificat</button>'}
        </div>
      </section>
    `;
  }).join('');

  const navItems = lessons.map((lesson, index) => `
    <button class="nav-item ${index === 0 ? 'active' : ''}" onclick="goToLesson(${index})">
      <span class="nav-number">${index + 1}</span>
      <span class="nav-title">${lesson.title}</span>
      <span class="nav-status">○</span>
    </button>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${level}</title>
    <style>
        :root {
            --primary: ${themeColor};
            --primary-light: ${gradientColor};
            --bg-light: #f8f9fa;
            --bg-dark: #1a1a2e;
            --text-light: #333;
            --text-dark: #e8e8e8;
            --success: #27ae60;
            --error: #e74c3c;
            --warning: #f39c12;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--bg-light);
            color: var(--text-light);
            line-height: 1.6;
            transition: all 0.3s ease;
        }
        
        body.dark-mode {
            background: var(--bg-dark);
            color: var(--text-dark);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .theme-toggle {
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: transform 0.2s;
        }
        
        .theme-toggle:hover {
            transform: scale(1.05);
        }
        
        .progress-container {
            background: rgba(0,0,0,0.1);
            border-radius: 25px;
            height: 30px;
            overflow: hidden;
            flex: 1;
            max-width: 400px;
            position: relative;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
            border-radius: 25px;
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 30px;
        }
        
        @media (max-width: 900px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            .sidebar {
                order: 2;
            }
        }
        
        .sidebar {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            height: fit-content;
            position: sticky;
            top: 20px;
        }
        
        body.dark-mode .sidebar {
            background: #252540;
        }
        
        .sidebar h3 {
            color: var(--primary);
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
            cursor: pointer;
            border-radius: 10px;
            transition: all 0.2s;
            margin-bottom: 5px;
        }
        
        .nav-item:hover {
            background: rgba(var(--primary), 0.1);
        }
        
        .nav-item.active {
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
        }
        
        .nav-item.completed .nav-status {
            color: var(--success);
        }
        
        .nav-number {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.1);
            border-radius: 50%;
            font-weight: bold;
        }
        
        .nav-title {
            flex: 1;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .content-area {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        body.dark-mode .content-area {
            background: #252540;
        }
        
        .lesson-header {
            border-bottom: 3px solid var(--primary);
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        
        .lesson-number {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .lesson-header h2 {
            color: var(--primary);
            font-size: 1.8rem;
        }
        
        .lesson-content {
            font-size: 1.1rem;
            margin-bottom: 30px;
        }
        
        .lesson-content p {
            margin-bottom: 15px;
        }
        
        .info-box {
            background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(52, 152, 219, 0.05));
            border-left: 4px solid #3498db;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }
        
        .warning-box {
            background: linear-gradient(135deg, rgba(241, 196, 15, 0.1), rgba(241, 196, 15, 0.05));
            border-left: 4px solid #f1c40f;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }
        
        .examples-box {
            background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(39, 174, 96, 0.05));
            border-left: 4px solid #27ae60;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }
        
        .examples-box h4 {
            color: #27ae60;
            margin-bottom: 10px;
        }
        
        .examples-box ul {
            list-style: none;
        }
        
        .examples-box li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .examples-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #27ae60;
        }
        
        .exercises-section {
            background: rgba(0,0,0,0.02);
            padding: 25px;
            border-radius: 15px;
            margin-top: 30px;
        }
        
        body.dark-mode .exercises-section {
            background: rgba(255,255,255,0.05);
        }
        
        .exercises-section h3 {
            color: var(--primary);
            margin-bottom: 20px;
        }
        
        .exercise {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        body.dark-mode .exercise {
            background: #1a1a2e;
        }
        
        .exercise-question {
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        
        .options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            background: rgba(0,0,0,0.03);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .option:hover {
            background: rgba(var(--primary), 0.1);
        }
        
        .option input {
            width: 18px;
            height: 18px;
            accent-color: var(--primary);
        }
        
        .option.correct {
            background: rgba(39, 174, 96, 0.2);
            border: 2px solid var(--success);
        }
        
        .option.incorrect {
            background: rgba(231, 76, 60, 0.2);
            border: 2px solid var(--error);
        }
        
        .feedback {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            background: rgba(52, 152, 219, 0.1);
        }
        
        .btn-validate {
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1rem;
            cursor: pointer;
            margin-top: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn-validate:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        .lesson-navigation {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(0,0,0,0.1);
        }
        
        .btn-nav {
            background: transparent;
            border: 2px solid var(--primary);
            color: var(--primary);
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
        }
        
        .btn-nav:hover, .btn-nav.btn-next {
            background: var(--primary);
            color: white;
        }
        
        .btn-certificate {
            background: linear-gradient(135deg, #f1c40f, #e67e22);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1rem;
            cursor: pointer;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .certificate {
            display: none;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #fff9e6, #fff);
            border: 5px solid #f1c40f;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .certificate h2 {
            color: #e67e22;
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        
        .certificate .trophy {
            font-size: 5rem;
            margin: 20px 0;
        }
        
        .certificate .score {
            font-size: 3rem;
            color: var(--primary);
            font-weight: bold;
        }
        
        .certificate .message {
            font-size: 1.3rem;
            color: #666;
            margin: 20px 0;
        }
        
        .certificate .badge {
            display: inline-block;
            padding: 10px 30px;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            border-radius: 25px;
            font-size: 1.2rem;
            margin-top: 20px;
        }
        
        .btn-print {
            background: #333;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 20px;
        }
        
        @media print {
            .sidebar, .controls, .btn-print, .lesson-navigation {
                display: none !important;
            }
            .certificate {
                display: block !important;
                border: none;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${title}</h1>
            <p class="subtitle">📚 ${subject} - Niveau ${level}</p>
        </header>
        
        <div class="controls">
            <button class="theme-toggle" onclick="toggleTheme()">🌙 Mode sombre</button>
            <div class="progress-container">
                <div class="progress-bar" id="progressBar" style="width: 0%">
                    <span id="progressText">0%</span>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <aside class="sidebar">
                <h3>📖 Sommaire</h3>
                <nav id="lessonNav">
                    ${navItems}
                </nav>
            </aside>
            
            <main class="content-area">
                ${lessonsHTML}
                
                <div class="certificate" id="certificate">
                    <h2>🎓 Certificat de Réussite</h2>
                    <div class="trophy">🏆</div>
                    <p>Félicitations ! Tu as terminé le manuel</p>
                    <p><strong>${title}</strong></p>
                    <div class="score" id="finalScore">0%</div>
                    <p class="message" id="certificateMessage"></p>
                    <div class="badge" id="levelBadge"></div>
                    <br>
                    <button class="btn-print" onclick="window.print()">🖨️ Imprimer mon certificat</button>
                </div>
            </main>
        </div>
    </div>
    
    <script>
        const totalLessons = ${lessons.length};
        let completedLessons = new Set();
        let lessonScores = {};
        
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const btn = document.querySelector('.theme-toggle');
            btn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Mode clair' : '🌙 Mode sombre';
        }
        
        function goToLesson(index) {
            document.querySelectorAll('.lesson').forEach(l => l.style.display = 'none');
            document.getElementById('lesson-' + (index + 1)).style.display = 'block';
            document.getElementById('certificate').style.display = 'none';
            
            document.querySelectorAll('.nav-item').forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
        }
        
        function validateLesson(lessonIndex) {
            const lesson = document.getElementById('lesson-' + (lessonIndex + 1));
            const exercises = lesson.querySelectorAll('.exercise');
            let correct = 0;
            let total = exercises.length;
            
            exercises.forEach((ex, exIndex) => {
                const correctAnswer = parseInt(ex.dataset.correct);
                const selected = ex.querySelector('input:checked');
                const options = ex.querySelectorAll('.option');
                const feedback = ex.querySelector('.feedback');
                
                options.forEach((opt, optIndex) => {
                    opt.classList.remove('correct', 'incorrect');
                    if (optIndex === correctAnswer) {
                        opt.classList.add('correct');
                    }
                });
                
                if (selected) {
                    const selectedValue = parseInt(selected.value);
                    if (selectedValue === correctAnswer) {
                        correct++;
                    } else {
                        options[selectedValue].classList.add('incorrect');
                    }
                }
                
                feedback.style.display = 'block';
            });
            
            const score = Math.round((correct / total) * 100);
            lessonScores[lessonIndex] = score;
            
            if (score >= 70) {
                completedLessons.add(lessonIndex);
                const navItem = document.querySelectorAll('.nav-item')[lessonIndex];
                navItem.classList.add('completed');
                navItem.querySelector('.nav-status').textContent = '✓';
            }
            
            updateProgress();
            
            const message = score === 100 ? '🌟 Parfait ! Excellent travail !' :
                           score >= 80 ? '👏 Très bien ! Continue comme ça !' :
                           score >= 70 ? '👍 Bien ! Tu peux passer à la suite.' :
                           '💪 Révise encore un peu et réessaie !';
            
            alert(message + '\\nScore : ' + score + '%');
        }
        
        function updateProgress() {
            const progress = Math.round((completedLessons.size / totalLessons) * 100);
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').textContent = progress + '%';
        }
        
        function showCertificate() {
            if (completedLessons.size < totalLessons) {
                alert('Tu dois compléter toutes les leçons avec au moins 70% de bonnes réponses pour obtenir ton certificat !');
                return;
            }
            
            document.querySelectorAll('.lesson').forEach(l => l.style.display = 'none');
            const cert = document.getElementById('certificate');
            cert.style.display = 'block';
            
            const avgScore = Math.round(Object.values(lessonScores).reduce((a, b) => a + b, 0) / totalLessons);
            document.getElementById('finalScore').textContent = avgScore + '%';
            
            let level, message;
            if (avgScore >= 95) {
                level = '🥇 Expert';
                message = 'Tu maîtrises parfaitement ce sujet !';
            } else if (avgScore >= 85) {
                level = '🥈 Avancé';
                message = 'Excellente maîtrise du sujet !';
            } else if (avgScore >= 75) {
                level = '🥉 Intermédiaire';
                message = 'Bonne compréhension du sujet !';
            } else {
                level = '📚 Apprenti';
                message = 'Tu as terminé le parcours, continue à progresser !';
            }
            
            document.getElementById('certificateMessage').textContent = message;
            document.getElementById('levelBadge').textContent = level;
        }
    </script>
</body>
</html>`;
};

export const AdminResourceGenerator: React.FC = () => {
  const [config, setConfig] = useState<ResourceConfig>({
    title: '',
    subject: '',
    level: '',
    themeColor: '#3498db',
    gradientColor: '#74b9ff',
    lessons: [{
      title: '',
      content: '',
      examples: [''],
      exercises: [{
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }]
    }]
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);

  React.useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('id, titre, matiere, niveau_scolaire')
      .order('matiere', { ascending: true });
    if (data) setLessons(data);
  };

  const handleSubjectChange = (value: string) => {
    const subject = SUBJECTS.find(s => s.value === value);
    if (subject) {
      setConfig(prev => ({
        ...prev,
        subject: subject.label,
        themeColor: subject.color,
        gradientColor: subject.gradient
      }));
    }
  };

  const addLesson = () => {
    setConfig(prev => ({
      ...prev,
      lessons: [...prev.lessons, {
        title: '',
        content: '',
        examples: [''],
        exercises: [{
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
        }]
      }]
    }));
  };

  const removeLesson = (index: number) => {
    setConfig(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    setConfig(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson
      )
    }));
  };

  const addExercise = (lessonIndex: number) => {
    setConfig(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) =>
        i === lessonIndex ? {
          ...lesson,
          exercises: [...lesson.exercises, {
            question: '',
            options: ['', '', '', ''],
            correctIndex: 0,
            explanation: ''
          }]
        } : lesson
      )
    }));
  };

  const updateExercise = (lessonIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    setConfig(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, li) =>
        li === lessonIndex ? {
          ...lesson,
          exercises: lesson.exercises.map((ex, ei) =>
            ei === exerciseIndex ? { ...ex, [field]: value } : ex
          )
        } : lesson
      )
    }));
  };

  const generatePreview = () => {
    const html = generateHTML(config);
    setPreviewHtml(html);
  };

  const downloadHTML = () => {
    const html = generateHTML(config);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generateSlug(config.title)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadToStorage = async (lessonId?: string) => {
    if (!config.title) {
      toast.error('Veuillez remplir le titre');
      return;
    }

    setIsUploading(true);
    try {
      const html = generateHTML(config);
      const blob = new Blob([html], { type: 'text/html' });
      const fileName = `${generateSlug(config.title)}.html`;
      const filePath = `interactive/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('interactive-resources')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('interactive-resources')
        .getPublicUrl(filePath);

      if (lessonId) {
        const { error: dbError } = await supabase
          .from('interactive_resources')
          .insert({
            titre: config.title,
            description: `Manuel interactif ${config.subject} - ${config.level}`,
            file_url: publicUrl,
            lesson_id: lessonId,
            slug: generateSlug(config.title),
            type: 'html'
          });

        if (dbError) throw dbError;
      }

      toast.success('Ressource uploadée avec succès !');
    } catch (error: any) {
      toast.error('Erreur lors de l\'upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Générateur de Ressources CREADOC
        </CardTitle>
        <CardDescription>
          Créez des manuels interactifs avec exercices et certificats de réussite
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="lessons">Leçons ({config.lessons.length})</TabsTrigger>
            <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre du manuel</Label>
                <Input
                  value={config.title}
                  onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Manuel Interactif Mathématiques CP"
                />
              </div>
              <div className="space-y-2">
                <Label>Niveau scolaire</Label>
                <Select value={config.level} onValueChange={(v) => setConfig(prev => ({ ...prev, level: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(subject => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Couleur thème</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="color"
                    value={config.gradientColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, gradientColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4 mt-4">
            {config.lessons.map((lesson, lessonIndex) => (
              <Card key={lessonIndex} className="border-l-4" style={{ borderLeftColor: config.themeColor }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Leçon {lessonIndex + 1}</CardTitle>
                    {config.lessons.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLesson(lessonIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre de la leçon</Label>
                    <Input
                      value={lesson.title}
                      onChange={(e) => updateLesson(lessonIndex, 'title', e.target.value)}
                      placeholder="Ex: Les nombres de 1 à 10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu (HTML supporté)</Label>
                    <Textarea
                      value={lesson.content}
                      onChange={(e) => updateLesson(lessonIndex, 'content', e.target.value)}
                      placeholder="<p>Contenu de la leçon...</p>"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Exemples</Label>
                    {lesson.examples.map((example, exIndex) => (
                      <div key={exIndex} className="flex gap-2">
                        <Input
                          value={example}
                          onChange={(e) => {
                            const newExamples = [...lesson.examples];
                            newExamples[exIndex] = e.target.value;
                            updateLesson(lessonIndex, 'examples', newExamples);
                          }}
                          placeholder={`Exemple ${exIndex + 1}`}
                        />
                        {lesson.examples.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newExamples = lesson.examples.filter((_, i) => i !== exIndex);
                              updateLesson(lessonIndex, 'examples', newExamples);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateLesson(lessonIndex, 'examples', [...lesson.examples, ''])}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter un exemple
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Exercices ({lesson.exercises.length})
                    </Label>
                    {lesson.exercises.map((exercise, exIndex) => (
                      <Card key={exIndex} className="p-4 bg-muted/30">
                        <div className="space-y-3">
                          <Input
                            value={exercise.question}
                            onChange={(e) => updateExercise(lessonIndex, exIndex, 'question', e.target.value)}
                            placeholder="Question..."
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {exercise.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${lessonIndex}-${exIndex}`}
                                  checked={exercise.correctIndex === optIndex}
                                  onChange={() => updateExercise(lessonIndex, exIndex, 'correctIndex', optIndex)}
                                />
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    const newOptions = [...exercise.options];
                                    newOptions[optIndex] = e.target.value;
                                    updateExercise(lessonIndex, exIndex, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                          <Input
                            value={exercise.explanation}
                            onChange={(e) => updateExercise(lessonIndex, exIndex, 'explanation', e.target.value)}
                            placeholder="Explication de la bonne réponse..."
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addExercise(lessonIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter un exercice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addLesson} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une leçon
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={generatePreview}>
                <Eye className="h-4 w-4 mr-2" /> Générer la prévisualisation
              </Button>
              <Button variant="outline" onClick={downloadHTML}>
                <Download className="h-4 w-4 mr-2" /> Télécharger HTML
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" /> Uploader
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Associer à une leçon</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez une leçon pour associer cette ressource interactive :
                    </p>
                    <Select onValueChange={(v) => uploadToStorage(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une leçon" />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.map(lesson => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.titre} ({lesson.matiere} - {lesson.niveau_scolaire})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => uploadToStorage()}
                    >
                      Uploader sans association
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {previewHtml && (
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  title="Prévisualisation"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminResourceGenerator;
