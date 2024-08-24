interface feedbackPromptProps {
  question: string;
  userAnswer: string;
}

export const feedbackPromptFormat = ({
  question,
  userAnswer,
}: feedbackPromptProps) => {
  return `Question : ${question} , User Answer: ${userAnswer}, Depends on Question and user answer for given interview question please give us rating for answer and feedback as area of improvement if any in just 3 to 5 lines to improve it in JSON format with rating field, feedback field and give us 5 mcqs within an array for which have an object key mcqs for the above question with mcqs field and options field with correct answer field but don't give any sort extra alphanumeric letters other than alphabets and object {} symbols and store questions in question and options in options key of the object.`;
};
