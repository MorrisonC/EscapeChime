using NUnit.Framework;
using RedInk;
using UnityEngine;

namespace RedInk.Tests.PlayMode
{
    [TestFixture]
    public class FullRunIntegrationTests
    {
        private GameObject runnerGO;
        private RunStateManager manager;
        private LifeSystem lifeSystem;
        private RoomController roomController;
        private DoorController doorController;
        private ChimeConductor chimeConductor;
        private GrammarQuestionBank bank;

        [SetUp]
        public void SetUp()
        {
            runnerGO = new GameObject("RunManagerGO");
            chimeConductor = runnerGO.AddComponent<ChimeConductor>();
            lifeSystem = runnerGO.AddComponent<LifeSystem>();
            doorController = runnerGO.AddComponent<DoorController>();
            roomController = runnerGO.AddComponent<RoomController>();
            manager = runnerGO.AddComponent<RunStateManager>();

            roomController.doorController = doorController;
            roomController.lifeSystem = lifeSystem;

            manager.lifeSystem = lifeSystem;
            manager.roomController = roomController;

            bank = GrammarQuestionBank.CreateDefaultBank();
        }

        [TearDown]
        public void TearDown()
        {
            if (runnerGO != null)
            {
                UnityEngine.Object.DestroyImmediate(runnerGO);
            }
        }

        [Test]
        public void AllCorrectAnswers_CompletesRunAsWin()
        {
            int seed = 1234;
            int roomCount = 10;
            manager.StartRun(bank, seed, roomCount);

            for (int i = 0; i < roomCount; i++)
            {
                Assert.That(manager.State, Is.EqualTo(RunState.InProgress));
                var currentRoom = roomController.CurrentPlan;
                manager.SubmitAnswer(currentRoom.question.correctAnswer);
            }

            Assert.That(manager.State, Is.EqualTo(RunState.Won));
            Assert.That(lifeSystem.MistakeCount, Is.EqualTo(0));

            var summary = manager.GetSummary();
            Assert.That(summary.state, Is.EqualTo(RunState.Won));
            Assert.That(summary.roomsCleared, Is.EqualTo(roomCount));
            Assert.That(summary.featuresLost, Is.EqualTo(0));
            Assert.That(summary.accuracy, Is.EqualTo(1f));
        }

        [Test]
        public void EightConsecutiveWrongAnswers_EndsRunAsDeath()
        {
            int seed = 5678;
            int roomCount = 10;
            manager.StartRun(bank, seed, roomCount);

            for (int i = 0; i < 8; i++)
            {
                Assert.That(manager.State, Is.EqualTo(RunState.InProgress));
                var currentRoom = roomController.CurrentPlan;
                string wrongAnswer = currentRoom.question.distractors[0];
                manager.SubmitAnswer(wrongAnswer);
            }

            Assert.That(manager.State, Is.EqualTo(RunState.Dead));
            Assert.That(lifeSystem.IsDead, Is.True);
            Assert.That(lifeSystem.MistakeCount, Is.EqualTo(8));

            var deadSummary = manager.GetSummary();
            manager.SubmitAnswer("anything");
            Assert.That(manager.GetSummary().totalAttempts, Is.EqualTo(deadSummary.totalAttempts));
        }

        [Test]
        public void RunSummaryPayload_ReportsAccurateStats()
        {
            int seed = 4321;
            int roomCount = 5;
            manager.StartRun(bank, seed, roomCount);

            // Room 0: 1 wrong answer, then 1 correct answer
            var room0 = roomController.CurrentPlan;
            manager.SubmitAnswer(room0.question.distractors[0]);
            var room0Retry = roomController.CurrentPlan;
            manager.SubmitAnswer(room0Retry.question.correctAnswer);

            // Room 1: 1 correct answer directly
            var room1 = roomController.CurrentPlan;
            manager.SubmitAnswer(room1.question.correctAnswer);

            var summary = manager.GetSummary();
            Assert.That(summary.seed, Is.EqualTo(seed));
            Assert.That(summary.totalRooms, Is.EqualTo(roomCount));
            Assert.That(summary.roomsCleared, Is.EqualTo(2));
            Assert.That(summary.totalAttempts, Is.EqualTo(3));
            Assert.That(summary.correctAnswers, Is.EqualTo(2));
            Assert.That(summary.mistakes, Is.EqualTo(1));
            Assert.That(summary.featuresLost, Is.EqualTo(1));
            Assert.That(summary.accuracy, Is.EqualTo(2f / 3f).Within(0.001f));
        }
    }
}
