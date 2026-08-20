using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;

[TestFixture]
public class ChimeConductorPlayModeTests
{
    private ChimeConductor _conductor;

    [SetUp]
    public void SetUp()
    {
        _conductor = new ChimeConductor();
#if !UNITY_5_3_OR_NEWER
        _conductor.audioSource = new UnityDummyAudioSource();
        _conductor.successClip = new UnityDummyAudioClip("chime_success.wav");
        _conductor.failureClip = new UnityDummyAudioClip("chime_failure.wav");
#endif
    }

    [Test]
    public void PlaySuccessChime_FiresThreeNoteEventsInOrder()
    {
        _conductor.PlaySuccessChime();
        Assert.That(_conductor.PlayedNotes, Is.EqualTo(new[] { "G4", "E4", "C4" }));
    }

    [Test]
    public void PlayFailureChime_FiresThreeNoteEventsInOrder()
    {
        _conductor.PlayFailureChime();
        Assert.That(_conductor.PlayedNotes, Is.EqualTo(new[] { "G4_detuned", "E4_detuned", "C4_detuned" }));
    }

    [Test]
    public void SuccessAndFailureChimes_UseDistinctAudioClips()
    {
        _conductor.PlaySuccessChime();
        var successClip = _conductor.audioSource.clip;

        _conductor.PlayFailureChime();
        var failureClip = _conductor.audioSource.clip;

        Assert.That(successClip, Is.Not.SameAs(failureClip));
        Assert.That(successClip.name, Is.Not.EqualTo(failureClip.name));
    }
}
