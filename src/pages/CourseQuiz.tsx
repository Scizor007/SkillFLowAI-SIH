import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Optional for dynamic confetti sizing
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import anime from 'animejs';
import { fetchQuiz, saveQuiz, generateQuizWithAI } from '@/services/quizService';
import { updateQuizScore } from '@/services/api';
import { fetchCourseById } from '@/services/courseService';
import ModuleQuiz from '@/components/course/ModuleQuiz';
import { Button } from '@/components/ui/button';

const CourseQuiz = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { updateUserSkills } = useUser();
  const navigate = useNavigate();
  const { width, height } = useWindowSize(); // For confetti sizing

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [passed, setPassed] = useState(false); // Track if the user passed

  // Fetch course and quiz data
  useEffect(() => {
    const loadCourseAndQuiz = async () => {
      if (!courseId) {
        setError("No course ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedCourse = await fetchCourseById(courseId);

        if (fetchedCourse) {
          setCourse(fetchedCourse);

          // Format quiz ID for consistency
          const quizId = `course-quiz-${courseId}`;
          console.log("Looking for quiz with ID:", quizId);

          try {
            // First try to fetch existing quiz
            const fetchedQuiz = await fetchQuiz(quizId);

            if (fetchedQuiz && fetchedQuiz.questions && fetchedQuiz.questions.length > 0) {
              console.log("Found existing quiz:", fetchedQuiz);
              setQuiz(fetchedQuiz);
              setLoading(false);
            } else {
              // If no quiz exists or it's empty, we need to generate one
              console.log("No quiz found, need to generate one");
              setGeneratingQuiz(true);

              // Show toast to inform user
              toast.info("Generating quiz with AI, please wait...");

              // Get modules if available, otherwise use an empty array
              const courseModules = fetchedCourse.courseModules || [];

              const questions = await generateQuizWithAI(
                courseId,
                courseModules,
                fetchedCourse.title || 'Course',
                fetchedCourse.description || ''
              );

              if (questions && questions.length > 0) {
                // Show generated questions immediately
                setQuiz({
                  id: quizId,
                  courseId: courseId,
                  questions: questions,
                  updatedAt: new Date().toISOString(),
                });
                // Save the generated quiz to the database
                const saveSuccess = await saveQuiz(quizId, questions);
                if (saveSuccess) {
                  // Fetch the newly saved quiz
                  const newQuiz = await fetchQuiz(quizId);
                  if (newQuiz && newQuiz.questions && newQuiz.questions.length > 0) {
                    setQuiz(newQuiz);
                    toast.success("Quiz generated successfully!");
                  }
                }
              } else {
                setError("Failed to generate quiz questions");
              }

              setGeneratingQuiz(false);
              setLoading(false);
            }
          } catch (quizErr) {
            console.error("Error fetching/generating quiz:", quizErr);
            setError("Failed to load or generate quiz");
            setGeneratingQuiz(false);
            setLoading(false);
          }
        } else {
          setError('Course not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading course and quiz:', err);
        setError('Failed to load quiz data');
        setLoading(false);
      }
    };

    loadCourseAndQuiz();
  }, [courseId]);

  // Animation for page elements
  useEffect(() => {
    if (!loading && !generatingQuiz) {
      // Animate the header
      anime({
        targets: '.quiz-header',
        translateY: [20, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 800,
        delay: 300
      });

      // Animate the quiz content
      anime({
        targets: '.quiz-content',
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1000,
        delay: 500
      });
    }
  }, [loading, generatingQuiz]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    if (!user || !courseId || !quiz) return;

    // Calculate score
    const questions = quiz.questions;
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    for (const question of questions) {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    }

    const score = correctAnswers;
    const isPassed = score >= totalQuestions * 0.8; // 80% passing threshold

    setQuizScore(score);
    setQuizSubmitted(true);
    setPassed(isPassed);

    try {
      // Fixed: Update quiz score with appropriate parameters
      const quizId = quiz.id || 'course-quiz';
      await updateQuizScore(user.id, courseId, quizId, score, null, null);

      // If user passed, update skills
      if (isPassed && course?.skillsOffered?.length > 0) {
        await updateUserSkills([...user.skills || [], ...course.skillsOffered]);
        toast.success('You have earned new skills!');
      }
    } catch (err) {
      console.error('Error updating quiz results:', err);
      toast.error('Failed to save quiz results');
    }
  };

  const navigateBack = () => {
    navigate(`/course/${courseId}`);
  };

  // Enhanced loading UI with animation
  const renderLoadingState = () => (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary-50"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Loading Quiz</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Please wait while we retrieve your quiz...
        </p>
      </div>
    </div>
  );

  // Enhanced quiz generation UI with animation
  const renderGeneratingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
      <h3 className="text-xl font-semibold mb-2">Generating Your Quiz</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
        Our AI is creating personalized questions based on the course content. This may take a moment...
      </p>
      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-pulse" style={{width: '70%'}}></div>
      </div>
    </div>
  );

  if (loading || generatingQuiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {renderLoadingState()}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="quiz-header mb-6 flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={navigateBack}
              >
                ← Back to Course
              </Button>
              <h1 className="text-3xl font-bold text-primary">
                {course?.title || 'Course'} - Final Quiz
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Test your knowledge of the entire course
              </p>
            </div>
          </div>

          <div className="quiz-content bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            {quizSubmitted ? (
              <div className="text-center">
                {passed ? (
                  <>
                    <Confetti width={width} height={height} />
                    <h2 className="text-2xl font-bold text-green-500">Congratulations! 🎉</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      You passed the quiz with a score of {quizScore}/{quiz.questions.length}.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="sad-effect">
                      <h2 className="text-2xl font-bold text-red-500">You Failed 😢</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Your score is {quizScore}/{quiz.questions.length}. Better luck next time!
                      </p>
                    </div>
                  </>
                )}
                <Button className="mt-4" onClick={navigateBack}>
                  Return to Course
                </Button>
              </div>
            ) : quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
              <ModuleQuiz 
                quiz={quiz}
                selectedAnswers={selectedAnswers}
                onAnswerSelect={handleAnswerSelect}
                onSubmit={handleQuizSubmit}
                submitted={quizSubmitted}
                score={quizScore}
                totalQuestions={quiz.questions.length}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No quiz available for this course</p>
                <Button onClick={navigateBack} className="mt-4">Return to Course</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseQuiz;
