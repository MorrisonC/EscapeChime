using NUnit.Framework;

[TestFixture]
public class TrialResolverTests
{
    private GrammarQuestionBank _bank;
    private TrialResolver _resolver;

    [SetUp]
    public void SetUp()
    {
        _bank = GrammarQuestionBank.CreateSeedContentSet();
        _resolver = new TrialResolver(_bank, 123);
        _resolver.OnEnterNewRoom();
    }

    [Test]
    public void CorrectAnswer_ReturnsCorrectOutcome()
    {
        GrammarQuestion question = _bank.ruleFamilies[0].templates[0];
        TrialResult result = _resolver.Resolve(question, question.correctAnswer);

        Assert.That(result.Outcome, Is.EqualTo(TrialOutcome.Correct));
        Assert.That(result.NextQuestion, Is.Null);
    }

    [Test]
    public void IncorrectAnswer_ReturnsIncorrectOutcome()
    {
        GrammarQuestion question = _bank.ruleFamilies[0].templates[0];
        string wrongAnswer = question.distractors[0];

        TrialResult result = _resolver.Resolve(question, wrongAnswer);

        Assert.That(result.Outcome, Is.EqualTo(TrialOutcome.Incorrect));
        Assert.That(result.NextQuestion, Is.Not.Null);
    }

    [Test]
    public void AfterIncorrectAnswer_NextQuestionIsSameRuleFamilyDifferentTemplate()
    {
        GrammarQuestion question = _bank.ruleFamilies[0].templates[0];
        string wrongAnswer = question.distractors[0];

        TrialResult result = _resolver.Resolve(question, wrongAnswer);

        Assert.That(result.NextQuestion.ruleFamily, Is.EqualTo(question.ruleFamily));
        Assert.That(result.NextQuestion.id, Is.Not.EqualTo(question.id));
    }

    [Test]
    public void AfterIncorrectAnswer_NeverRepeatsIdenticalQuestionConsecutively()
    {
        GrammarQuestion question = _bank.ruleFamilies[0].templates[0];

        GrammarQuestion current = question;
        for (int i = 0; i < 5; i++)
        {
            TrialResult result = _resolver.Resolve(current, "definitely_wrong_answer");
            Assert.That(result.NextQuestion.id, Is.Not.EqualTo(current.id));
            current = result.NextQuestion;
        }
    }
}
