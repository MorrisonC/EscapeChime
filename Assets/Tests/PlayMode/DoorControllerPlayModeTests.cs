using NUnit.Framework;
using RedInk;
using UnityEngine;

namespace RedInk.Tests.PlayMode
{
    [TestFixture]
    public class DoorControllerPlayModeTests
    {
        private GameObject goDoor;
        private DoorController doorController;
        private GameObject goChime;
        private ChimeConductor chimeConductor;

        [SetUp]
        public void SetUp()
        {
            goChime = new GameObject("ChimeConductor");
            chimeConductor = goChime.AddComponent<ChimeConductor>();

            goDoor = new GameObject("DoorController");
            doorController = goDoor.AddComponent<DoorController>();
        }

        [TearDown]
        public void TearDown()
        {
            if (goDoor != null) UnityEngine.Object.DestroyImmediate(goDoor);
            if (goChime != null) UnityEngine.Object.DestroyImmediate(goChime);
        }

        [Test]
        public void CorrectAnswerSubmitted_DoorUnlocksAndOpens()
        {
            doorController.ResetDoor();
            Assert.That(doorController.IsLocked, Is.True);
            Assert.That(doorController.IsIsOpen, Is.False);

            doorController.HandleTrialOutcome(TrialOutcome.Correct);

            Assert.That(doorController.IsLocked, Is.False);
            Assert.That(doorController.IsIsOpen, Is.True);
        }

        [Test]
        public void IncorrectAnswerSubmitted_DoorRemainsLocked()
        {
            doorController.ResetDoor();
            doorController.HandleTrialOutcome(TrialOutcome.Incorrect);

            Assert.That(doorController.IsLocked, Is.True);
            Assert.That(doorController.IsIsOpen, Is.False);
        }

        [Test]
        public void DoorUnlock_TriggersChimeConductorSuccessCall()
        {
            doorController.ResetDoor();
            doorController.UnlockAndOpen();

            Assert.That(chimeConductor.LastPlayedIsSuccess, Is.True);
        }
    }
}
