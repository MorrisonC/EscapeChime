using NUnit.Framework;

[TestFixture]
public class DoorControllerPlayModeTests
{
    private DoorController _door;
    private ChimeConductor _chimeConductor;

    [SetUp]
    public void SetUp()
    {
        _chimeConductor = new ChimeConductor();
#if !UNITY_5_3_OR_NEWER
        _chimeConductor.audioSource = new UnityDummyAudioSource();
        _chimeConductor.successClip = new UnityDummyAudioClip("chime_success.wav");
        _chimeConductor.failureClip = new UnityDummyAudioClip("chime_failure.wav");
#endif
        _door = new DoorController(_chimeConductor);
    }

    [Test]
    public void Door_InitialState_IsLockedAndClosed()
    {
        DoorController freshDoor = new DoorController();
        Assert.That(freshDoor.IsLocked, Is.True);
        Assert.That(freshDoor.IsOpen, Is.False);
    }

    [Test]
    public void CorrectAnswerSubmitted_DoorUnlocksAndOpens()
    {
        _door.OnAnswerSubmitted(TrialOutcome.Correct);
        Assert.That(_door.IsLocked, Is.False);
        Assert.That(_door.IsOpen, Is.True);
    }

    [Test]
    public void IncorrectAnswerSubmitted_DoorRemainsLocked()
    {
        _door.OnAnswerSubmitted(TrialOutcome.Incorrect);
        Assert.That(_door.IsLocked, Is.True);
        Assert.That(_door.IsOpen, Is.False);
    }

    [Test]
    public void DoorUnlock_TriggersChimeConductorSuccessCall()
    {
        _door.OnAnswerSubmitted(TrialOutcome.Correct);
        Assert.That(_chimeConductor.PlayedNotes, Is.EqualTo(new[] { "G4", "E4", "C4" }));
        Assert.That(_chimeConductor.audioSource.clip, Is.SameAs(_chimeConductor.successClip));
    }

    [Test]
    public void DoorLockAndUnlock_StateTransitions()
    {
        // Fail -> remains locked
        _door.OnAnswerSubmitted(TrialOutcome.Incorrect);
        Assert.That(_door.IsLocked, Is.True);

        // Succeed -> unlocks
        _door.OnAnswerSubmitted(TrialOutcome.Correct);
        Assert.That(_door.IsLocked, Is.False);
        Assert.That(_door.IsOpen, Is.True);

        // Fail again -> re-locks
        _door.OnAnswerSubmitted(TrialOutcome.Incorrect);
        Assert.That(_door.IsLocked, Is.True);
        Assert.That(_door.IsOpen, Is.False);
    }

    [Test]
    public void DoorController_WithoutChimeConductor_HandlesSubmissionsSafely()
    {
        DoorController nullChimeDoor = new DoorController(null);
        Assert.DoesNotThrow(() => nullChimeDoor.OnAnswerSubmitted(TrialOutcome.Correct));
        Assert.That(nullChimeDoor.IsLocked, Is.False);
        Assert.That(nullChimeDoor.IsOpen, Is.True);
    }
}
