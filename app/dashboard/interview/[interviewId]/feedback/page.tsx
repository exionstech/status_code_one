"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { db } from "@/utils/db";
import { McqDetails, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { formatMcqData } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface McqSaveType {
  question: string;
  isCorrect: boolean;
  correctAnswer: string;
}

const FeedBackPage = ({ params }: { params: { interviewId: string } }) => {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [mcqList, setMcqList] = useState<any[]>([]);
  const [showMcqs, setShowMcqs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [mcqAnswer, setMcqAnswer] = useState<McqSaveType[]>([]);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, [params.interviewId]);

  const GetFeedback = async () => {
    try {
      const feedbackResult = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdref, params.interviewId))
        .orderBy(UserAnswer.id);
      setFeedbackList(feedbackResult);

      const mcqResult = await db
        .select({
          id: McqDetails.id,
          mockIdref: McqDetails.mockIdref,
          mcqs: McqDetails.mcqs,
          createdAt: McqDetails.createdAt,
        })
        .from(McqDetails)
        .where(eq(McqDetails.mockIdref, params.interviewId))
        .orderBy(McqDetails.id);

      const formattedMcq = formatMcqData(mcqResult);
      setMcqList(formattedMcq);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRedirectDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/dashboard`);
      setLoading(false);
    }, 1400);
  };

  const handleShowMcqs = () => {
    setShowMcqs(!showMcqs);
  };

  const handleNext = () => {
    if (activeQuestion < mcqList.length - 1) {
      setActiveQuestion(activeQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    }
  };

  const handleSave = () => {
    const updatedAnswers = [...mcqAnswer];
    updatedAnswers[activeQuestion] = {
      question: mcqList[activeQuestion].question,
      isCorrect:
        mcqList[activeQuestion].correctAnswer ===
        mcqAnswer[activeQuestion]?.correctAnswer,
      correctAnswer: mcqList[activeQuestion].correctAnswer,
    };
    setMcqAnswer(updatedAnswers);
    console.log(updatedAnswers);
    
    toast.success("Answer saved");
  };

  const handleSubmit = () => {
    toast.success("Submitted successfully");
  };

  return (
    <div className="flex flex-col p-4">
      {feedbackList.length === 0 ? (
        <div className="flex flex-col gap-3 w-full h-full items-center justify-center pt-20">
          <h2 className="font-bold text-2xl text-gray-700">
            No interview feedback Found
          </h2>
          <Button
            onClick={handleRedirectDashboard}
            isLoading={loading}
            loadingText="Redirecting"
            type="button"
            variant="shine"
          >
            Back to home
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl text-emerald-700 font-bold">
            Congratulations!
          </h2>
          <p className="text-xl font-semibold">
            Here is your interview feedback
          </p>
          <p className="text-sm text-muted-foreground">
            Find below interview questions with the correct answer, your answer,
            and feedback for improvement.
          </p>
        </div>
      )}

      <ScrollArea className="mt-2 h-[58vh] w-full py-2 px-3">
        {feedbackList.map((item, index) => (
          <Collapsible key={index} className="py-[2px]">
            <CollapsibleTrigger className="p-2 bg-gray-500/20 rounded-lg my-2 text-left flex items-center justify-between w-full">
              <p className="font-bold text-rose-600">
                <span className="text-md text-black font-semibold">
                  {item?.question}
                </span>
              </p>
              <span className="flex items-center justify-center bg-gray-600/20 p-2 rounded-md">
                <ChevronsUpDown className="size-5" />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-2">
              <div className="flex flex-col gap-2">
                <h2
                  className={cn(
                    "text-sm px-2 underline",
                    item.rating <= 5 ? "text-red-600" : "text-green-700"
                  )}
                >
                  <span className="font-bold">Rating: </span>
                  {item?.rating}
                </h2>
                <h2
                  className={cn(
                    "py-2 px-2 border rounded-lg text-sm",
                    item.rating <= 4
                      ? "bg-red-400/40 border-red-600/50"
                      : item.rating >= 7
                      ? "bg-green-400/40 border-green-700"
                      : "bg-yellow-400/40 border-yellow-700"
                  )}
                >
                  <span className="font-bold">Your answer: </span>
                  {item?.userAnswer}
                </h2>
                <h2 className="py-2 px-2 border rounded-lg bg-green-300/40 text-sm border-green-700">
                  <span className="font-bold">Correct Answer: </span>
                  {item?.correctAnswer}
                </h2>
                <h2 className="py-2 px-2 border rounded-lg bg-blue-400/40 text-sm border-blue-700">
                  <span className="font-bold">Feedback: </span>
                  {item?.feedback}
                </h2>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-2" onClick={handleShowMcqs}>
                    Suggest Some MCQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex flex-col justify-start items-start space-y-2">
                  {showMcqs && mcqList.length > 0 && (
                    <div className="mt-5">
                      <div className="">
                        <div>
                          <h2 className="py-2 px-2 border rounded-lg bg-blue-400/40 text-sm border-blue-700">
                            <span className="font-bold">
                              Question {activeQuestion + 1}
                              {": "}
                            </span>
                            {mcqList[activeQuestion].question}
                          </h2>
                          <RadioGroup
                            className="mt-2 space-y-4"
                            onValueChange={(value) => {
                              const updatedAnswers = [...mcqAnswer];
                              updatedAnswers[activeQuestion] = {
                                question: mcqList[activeQuestion].question,
                                isCorrect:
                                  value ===
                                  mcqList[activeQuestion].correctAnswer,
                                correctAnswer: value,
                              };
                              setMcqAnswer(updatedAnswers);
                            }}
                            value={
                              mcqAnswer[activeQuestion]?.correctAnswer || ""
                            }
                          >
                            {mcqList[activeQuestion].options.map(
                              (option: any, index: any) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option.option}
                                    id={`option-${index}`}
                                  />
                                  <Label htmlFor={`option-${index}`}>
                                    {option.option}
                                  </Label>
                                </div>
                              )
                            )}
                          </RadioGroup>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="space-x-2">
                            <Button onClick={handlePrev} className="mt-5">
                              Previous
                            </Button>
                            <Button onClick={handleNext} className="mt-5">
                              Next
                            </Button>
                          </div>
                          <div className="space-x-2">
                            <Button
                              onClick={() => {
                                handleSave();
                              }}
                              className="mt-5"
                            >
                              Save
                            </Button>
                            {activeQuestion === mcqList.length - 1 && (
                              <Button
                                onClick={() => {
                                  handleSubmit();
                                }}
                                className="mt-5"
                              >
                                Submit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </ScrollArea>
    </div>
  );
};

export default FeedBackPage;
