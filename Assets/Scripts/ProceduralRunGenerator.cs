using System;
using System.Collections.Generic;
using System.Linq;

namespace RedInk
{
    public class ProceduralRunGenerator
    {
        public static List<RoomPlan> GenerateRun(GrammarQuestionBank bank, int seed, int roomCount = 10)
        {
            if (bank == null || bank.questions == null || bank.questions.Count == 0)
            {
                throw new ArgumentException("Bank is null or empty.");
            }

            var familyGroups = bank.questions
                .Where(q => q != null && !string.IsNullOrEmpty(q.ruleFamily))
                .GroupBy(q => q.ruleFamily)
                .Select(g => g.First())
                .ToList();

            if (roomCount > familyGroups.Count)
            {
                throw new ArgumentOutOfRangeException(nameof(roomCount), $"Requested {roomCount} rooms, but bank only has {familyGroups.Count} unique rule families.");
            }

            var rng = new Random(seed);

            var availableQuestions = new List<GrammarQuestion>(familyGroups);
            for (int i = availableQuestions.Count - 1; i > 0; i--)
            {
                int k = rng.Next(i + 1);
                var temp = availableQuestions[i];
                availableQuestions[i] = availableQuestions[k];
                availableQuestions[k] = temp;
            }

            var rooms = new List<RoomPlan>();
            for (int i = 0; i < roomCount; i++)
            {
                var q = availableQuestions[i];
                int templateIndex = rng.Next(q.sentenceTemplates.Length);

                var options = new List<string> { q.correctAnswer };
                if (q.distractors != null)
                {
                    options.AddRange(q.distractors);
                }

                for (int j = options.Count - 1; j > 0; j--)
                {
                    int k = rng.Next(j + 1);
                    var temp = options[j];
                    options[j] = options[k];
                    options[k] = temp;
                }

                rooms.Add(new RoomPlan(i, q, templateIndex, options.ToArray()));
            }

            return rooms;
        }
    }
}
