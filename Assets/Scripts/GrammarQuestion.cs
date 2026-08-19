using System;

namespace RedInk
{
    [Serializable]
    public class GrammarQuestion
    {
        public string id;
        public QuestionCategory category;
        public string ruleFamily;
        public string[] sentenceTemplates;
        public string correctAnswer;
        public string[] distractors;
        public int difficulty;

        public GrammarQuestion() { }

        public GrammarQuestion(
            string id,
            QuestionCategory category,
            string ruleFamily,
            string[] sentenceTemplates,
            string correctAnswer,
            string[] distractors,
            int difficulty = 1)
        {
            this.id = id;
            this.category = category;
            this.ruleFamily = ruleFamily;
            this.sentenceTemplates = sentenceTemplates;
            this.correctAnswer = correctAnswer;
            this.distractors = distractors;
            this.difficulty = difficulty;
        }
    }
}
