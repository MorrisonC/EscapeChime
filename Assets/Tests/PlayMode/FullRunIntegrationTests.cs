using System.Collections.Generic;
using NUnit.Framework;

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

        RunStateManager runManager = new RunStateManager(seed, roomCount, _lifeSystem);
        TrialResolver resolver = new TrialResolver(_bank, seed);
        DoorController door = new DoorController();
        RoomController roomController = new RoomController(resolver, door, runManager);

        foreach (var room in run)
        {
            roomController.EnterRoom(room);
            TrialResult result = roomController.SubmitAnswer(room.Question.correctAnswer);

            Assert.That(result.Outcome, Is.EqualTo(TrialOutcome.Correct));
            Assert.That(door.IsLocked, Is.False);
            Assert.That(door.IsOpen, Is.True);
        }

        RunSummaryPayload summary = runManager.GenerateSummaryPayload();

        Assert.That(runManager.RoomsCleared, Is.EqualTo(roomCount));
        Assert.That(runManager.MistakesMade, Is.EqualTo(0));
        Assert.That(runManager.IsWin, Is.True);
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(8));
        Assert.That(_lifeSystem.IsDead, Is.False);

        Assert.That(summary.Seed, Is.EqualTo(seed));
        Assert.That(summary.RoomsCleared, Is.EqualTo(roomCount));
        Assert.That(summary.MistakesMade, Is.EqualTo(0));
        Assert.That(summary.Won, Is.True);
    }

    [Test]
    public void MixedOutcomeRun_MistakesFollowedByCorrectAnswers_WinsWithAccurateStats()
    {
        int seed = 789;
        int roomCount = 5;
        Room[] run = _generator.GenerateRun(_bank, seed, roomCount);

        RunStateManager runManager = new RunStateManager(seed, roomCount, _lifeSystem);
        TrialResolver resolver = new TrialResolver(_bank, seed);
        DoorController door = new DoorController();
        RoomController roomController = new RoomController(resolver, door, runManager);

        int expectedMistakes = 3;
        int totalMistakesMade = 0;

        foreach (var room in run)
        {
            roomController.EnterRoom(room);

            // Make a mistake on first 3 rooms before giving correct answer
            if (totalMistakesMade < expectedMistakes)
            {
                TrialResult failResult = roomController.SubmitAnswer(room.Question.distractors[0]);
                Assert.That(failResult.Outcome, Is.EqualTo(TrialOutcome.Incorrect));
                Assert.That(door.IsLocked, Is.True);
                totalMistakesMade++;
            }

            // Now give correct answer to clear room
            TrialResult winResult = roomController.SubmitAnswer(roomController.CurrentQuestion.correctAnswer);
            Assert.That(winResult.Outcome, Is.EqualTo(TrialOutcome.Correct));
            Assert.That(door.IsLocked, Is.False);
        }

        RunSummaryPayload summary = runManager.GenerateSummaryPayload();

        Assert.That(runManager.RoomsCleared, Is.EqualTo(roomCount));
        Assert.That(runManager.MistakesMade, Is.EqualTo(expectedMistakes));
        Assert.That(runManager.IsWin, Is.True);
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(8 - expectedMistakes));

        Assert.That(summary.RoomsCleared, Is.EqualTo(roomCount));
        Assert.That(summary.MistakesMade, Is.EqualTo(expectedMistakes));
        Assert.That(summary.Won, Is.True);
    }

    [Test]
    public void EightConsecutiveWrongAnswers_EndsRunAsDeath()
    {
        int seed = 404;
        int roomCount = 10;
        Room[] run = _generator.GenerateRun(_bank, seed, roomCount);

        RunStateManager runManager = new RunStateManager(seed, roomCount, _lifeSystem);
        TrialResolver resolver = new TrialResolver(_bank, seed);
        DoorController door = new DoorController();
        RoomController roomController = new RoomController(resolver, door, runManager);

        roomController.EnterRoom(run[0]);

        // Submit 8 wrong answers in room 1
        for (int i = 0; i < 8; i++)
        {
            TrialResult failResult = roomController.SubmitAnswer("wrong_answer");
            Assert.That(failResult.Outcome, Is.EqualTo(TrialOutcome.Incorrect));
        }

        RunSummaryPayload summary = runManager.GenerateSummaryPayload();

        Assert.That(_lifeSystem.IsDead, Is.True);
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(0));
        Assert.That(runManager.IsDeath, Is.True);
        Assert.That(runManager.IsRunActive, Is.False);
        Assert.That(runManager.RoomsCleared, Is.EqualTo(0));
        Assert.That(runManager.MistakesMade, Is.EqualTo(8));

        Assert.That(summary.Won, Is.False);
        Assert.That(summary.RoomsCleared, Is.EqualTo(0));
        Assert.That(summary.MistakesMade, Is.EqualTo(8));
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
