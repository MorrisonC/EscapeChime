using System;
using System.Collections.Generic;

namespace RedInk
{
    public enum TrialOutcome
    {
        Correct,
        Incorrect
    }

    public class TrialResolver
    {
        public static TrialOutcome EvaluateAnswer(GrammarQuestion question, string submittedAnswer)
        {
            if (question == null || string.IsNullOrEmpty(question.correctAnswer))
            {
                return TrialOutcome.Incorrect;
            }

            return string.Equals(question.correctAnswer, submittedAnswer, StringComparison.Ordinal)
                ? TrialOutcome.Correct
                : TrialOutcome.Incorrect;
        }

        public static RoomPlan GetFollowUpPresentation(
            GrammarQuestion question,
            int currentTemplateIndex,
            string[] currentOptionsOrder,
            int seed)
        {
            if (question == null) return null;

            var rng = new Random(seed);

            int nextTemplateIndex = currentTemplateIndex;
            if (question.sentenceTemplates != null && question.sentenceTemplates.Length > 1)
            {
                do
                {
                    nextTemplateIndex = rng.Next(question.sentenceTemplates.Length);
                } while (nextTemplateIndex == currentTemplateIndex);
            }

            var options = new List<string> { question.correctAnswer };
            if (question.distractors != null)
            {
                options.AddRange(question.distractors);
            }

            string[] newOptionsOrder;
            int maxAttempts = 20;
            int attempt = 0;
            do
            {
                for (int j = options.Count - 1; j > 0; j--)
                {
                    int k = rng.Next(j + 1);
                    var temp = options[j];
                    options[j] = options[k];
                    options[k] = temp;
                }
                newOptionsOrder = options.ToArray();
                attempt++;
            } while (attempt < maxAttempts && AreArraysEqual(newOptionsOrder, currentOptionsOrder) && options.Count > 1);

            return new RoomPlan(0, question, nextTemplateIndex, newOptionsOrder);
        }

        private static bool AreArraysEqual(string[] a, string[] b)
        {
            if (a == null || b == null) return false;
            if (a.Length != b.Length) return false;
            for (int i = 0; i < a.Length; i++)
            {
                if (!string.Equals(a[i], b[i], StringComparison.Ordinal)) return false;
            }
            return true;
        }
    }
}
