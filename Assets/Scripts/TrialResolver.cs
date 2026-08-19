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
        _bank = bank;
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

        bool isCorrect = string.Equals(currentQuestion.correctAnswer, submittedAnswer, StringComparison.OrdinalIgnoreCase);

        if (isCorrect)
        {
            return new TrialResult { Outcome = TrialOutcome.Correct, NextQuestion = null };
        }
        else
        {
            // Find the rule family for the current question
            RuleFamily family = _bank.ruleFamilies.FirstOrDefault(f => f.id == currentQuestion.ruleFamily);
            if (family == null || family.templates == null || family.templates.Count <= 1)
            {
                // Fallback: just return the same question if we have no other templates
                return new TrialResult { Outcome = TrialOutcome.Incorrect, NextQuestion = currentQuestion };
            }

            // Find all other templates in the same family that we haven't seen in this room yet
            List<GrammarQuestion> unseenTemplates = family.templates.Where(t => !_seenQuestionsInCurrentRoom.Contains(t.id)).ToList();

            if (unseenTemplates.Count == 0)
            {
                 // If we've exhausted all templates in this family, we might have to repeat.
                 // But GDD 3.3 says "no single room ever shows the exact same sentence+option-order twice"
                 // Since there are 3 templates minimum, we shouldn't hit this normally unless they fail 3+ times.
                 // To adhere strictly, we will pull from otherTemplates excluding the IMMEDIATE current one to at least not repeat consecutively if we ran out.
                 unseenTemplates = family.templates.Where(t => t.id != currentQuestion.id).ToList();
            }

            // Pick a random template from the unseen (or remaining) ones
            int nextIndex = _rnd.Next(unseenTemplates.Count);
            GrammarQuestion nextQuestion = unseenTemplates[nextIndex];

            return new TrialResult { Outcome = TrialOutcome.Incorrect, NextQuestion = nextQuestion };
        }
    }
}
