using System;
using System.Collections.Generic;
using System.Linq;

public class Room
{
    public GrammarQuestion Question { get; set; } = new GrammarQuestion();
}

public class ProceduralRunGenerator
{
    public Room[] GenerateRun(GrammarQuestionBank bank, int seed, int roomCount)
    {
        if (bank == null || bank.ruleFamilies == null)
            throw new ArgumentException("Bank is null or empty");

        if (roomCount > bank.ruleFamilies.Count)
            throw new ArgumentException($"Requested {roomCount} rooms, but only {bank.ruleFamilies.Count} unique rule families exist in the bank.");

        System.Random rnd = new System.Random(seed);
        Room[] run = new Room[roomCount];

        // Shuffle rule families to pick unique ones for the run
        List<RuleFamily> shuffledFamilies = new List<RuleFamily>(bank.ruleFamilies);
        int n = shuffledFamilies.Count;
        while (n > 1)
        {
            n--;
            int k = rnd.Next(n + 1);
            RuleFamily value = shuffledFamilies[k];
            shuffledFamilies[k] = shuffledFamilies[n];
            shuffledFamilies[n] = value;
        }

        // Pick the first 'roomCount' rule families
        for (int i = 0; i < roomCount; i++)
        {
            RuleFamily family = shuffledFamilies[i];

            // Pick a random template from this family
            if (family.templates == null || family.templates.Count == 0)
                throw new Exception($"Rule family {family.id} has no templates.");

            int templateIndex = rnd.Next(family.templates.Count);
            GrammarQuestion selectedQuestion = family.templates[templateIndex];

            run[i] = new Room { Question = selectedQuestion };
        }

        return run;
    }
}
