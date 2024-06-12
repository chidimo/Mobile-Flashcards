import { QuizMaster } from "@/components/deck/quiz-master";
import { QuizProvider } from "@/context/quiz-context";

export default function Quiz() {
  return (
    <QuizProvider>
      <QuizMaster />
    </QuizProvider>
  );
}
