using System;
using System.Collections.Generic;
using System.Linq;

public enum TrialOutcome
{
    Correct,
    Incorrect
}

public class TrialResult
{
    public TrialOutcome Outcome { get; set; }
    public GrammarQuestion NextQuestion { get; set; } = new GrammarQuestion(); // Null if correct, or next variant if incorrect
}

public class TrialResolver
{
    private GrammarQuestionBank _bank;
    private Random _rnd;
    private HashSet<string> _seenQuestionsInCurrentRoom;

    public TrialResolver(GrammarQuestionBank bank, int seed)
    {
        _bank = bank ?? throw new ArgumentNullException(nameof(bank));
        _rnd = new Random(seed);
        _seenQuestionsInCurrentRoom = new HashSet<string>();
    }

    public void OnEnterNewRoom()
    {
        _seenQuestionsInCurrentRoom.Clear();
    }

    public TrialResult Resolve(GrammarQuestion currentQuestion, string submittedAnswer)
    {
        if (currentQuestion == null)
            throw new ArgumentNullException(nameof(currentQuestion));

        _seenQuestionsInCurrentRoom.Add(currentQuestion.id);

        string cleanExpected = (currentQuestion.correctAnswer ?? "").Trim();
        string cleanSubmitted = (submittedAnswer ?? "").Trim();

        bool isCorrect = !string.IsNullOrEmpty(cleanSubmitted) &&
                         string.Equals(cleanExpected, cleanSubmitted, StringComparison.OrdinalIgnoreCase);

        if (isCorrect)
        {
            return new TrialResult { Outcome = TrialOutcome.Correct, NextQuestion = null };
        }
        else
        {
            // Find the rule family for the current question
            RuleFamily family = _bank.ruleFamilies?.FirstOrDefault(f => f.id == currentQuestion.ruleFamily);
            if (family == null || family.templates == null || family.templates.Count == 0)
            {
                return new TrialResult { Outcome = TrialOutcome.Incorrect, NextQuestion = currentQuestion };
            }

            // Find all templates in the same family that we haven't seen in this room yet
            List<GrammarQuestion> unseenTemplates = family.templates.Where(t => !_seenQuestionsInCurrentRoom.Contains(t.id)).ToList();

            if (unseenTemplates.Count == 0)
            {
                // If we've exhausted all unseen templates in this family, pick from other templates excluding the immediate current one
                unseenTemplates = family.templates.Where(t => t.id != currentQuestion.id).ToList();
            }

            if (unseenTemplates.Count == 0)
            {
                // Fallback to currentQuestion if family has only 1 template total
                unseenTemplates = new List<GrammarQuestion> { currentQuestion };
            }

            // Pick a random template from the candidate pool
            int nextIndex = _rnd.Next(unseenTemplates.Count);
            GrammarQuestion nextQuestion = unseenTemplates[nextIndex];

            return new TrialResult { Outcome = TrialOutcome.Incorrect, NextQuestion = nextQuestion };
        }
    }
}
