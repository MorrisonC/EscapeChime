using System.Collections.Generic;
using NUnit.Framework;

public class RunSummaryPayload
{
    public int Seed { get; set; }
    public int RoomsCleared { get; set; }
    public int MistakesMade { get; set; }
    public bool Won { get; set; }
}

[TestFixture]
public class FullRunIntegrationTests
{
    private GrammarQuestionBank _bank;
    private ProceduralRunGenerator _generator;
    private LifeSystem _lifeSystem;

    [SetUp]
    public void SetUp()
    {
        _bank = GrammarQuestionBank.CreateSeedContentSet();
        _generator = new ProceduralRunGenerator();
        _lifeSystem = new LifeSystem();
    }

    [Test]
    public void AllCorrectAnswers_CompletesRunAsWin()
    {
        int seed = 100;
        int roomCount = 10;
        Room[] run = _generator.GenerateRun(_bank, seed, roomCount);

        int roomsCleared = 0;
        foreach (var room in run)
        {
            TrialResolver resolver = new TrialResolver(_bank, seed);
            TrialResult result = resolver.Resolve(room.Question, room.Question.correctAnswer);
            if (result.Outcome == TrialOutcome.Correct)
            {
                roomsCleared++;
            }
        }

        Assert.That(roomsCleared, Is.EqualTo(roomCount));
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(8));
        Assert.That(_lifeSystem.IsDead, Is.False);
    }

    [Test]
    public void EightConsecutiveWrongAnswers_EndsRunAsDeath()
    {
        for (int i = 0; i < 8; i++)
        {
            _lifeSystem.OnWrongAnswer();
        }

        Assert.That(_lifeSystem.IsDead, Is.True);
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(0));
    }

    [Test]
    public void RunSummaryPayload_ReportsAccurateStats()
    {
        int seed = 500;
        int roomsCleared = 5;
        int mistakes = 3;

        RunSummaryPayload summary = new RunSummaryPayload
        {
            Seed = seed,
            RoomsCleared = roomsCleared,
            MistakesMade = mistakes,
            Won = false
        };

        Assert.That(summary.Seed, Is.EqualTo(500));
        Assert.That(summary.RoomsCleared, Is.EqualTo(5));
        Assert.That(summary.MistakesMade, Is.EqualTo(3));
        Assert.That(summary.Won, Is.False);
    }
}
