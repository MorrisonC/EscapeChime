using System;
using System.Collections.Generic;
using NUnit.Framework;

[TestFixture]
public class LifeSystemTests
{
    private LifeSystem _lifeSystem;
    private List<RedactionFeature> _lostFeatures;
    private bool _died;

    [SetUp]
    public void SetUp()
    {
        _lifeSystem = new LifeSystem();
        _lostFeatures = new List<RedactionFeature>();
        _died = false;

        _lifeSystem.OnFeatureLost += (feature) => _lostFeatures.Add(feature);
        _lifeSystem.OnDeath += () => _died = true;
    }

    [Test]
    public void WrongAnswer_RemovesExactlyOneFeature()
    {
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(8));
        _lifeSystem.OnWrongAnswer();
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(7));
        Assert.That(_lostFeatures.Count, Is.EqualTo(1));
    }

    [Test]
    public void FeaturesAreLostInFixedOrder()
    {
        RedactionFeature[] expectedOrder = new RedactionFeature[]
        {
            RedactionFeature.LeftEar,
            RedactionFeature.RightEar,
            RedactionFeature.LeftEyebrow,
            RedactionFeature.RightEyebrow,
            RedactionFeature.Nose,
            RedactionFeature.LeftEye,
            RedactionFeature.RightEye,
            RedactionFeature.Mouth
        };

        for (int i = 0; i < 8; i++)
        {
            _lifeSystem.OnWrongAnswer();
        }

        Assert.That(_lostFeatures, Is.EqualTo(expectedOrder));
    }

    [Test]
    public void EighthWrongAnswer_TriggersDeath()
    {
        for (int i = 0; i < 7; i++)
        {
            _lifeSystem.OnWrongAnswer();
            Assert.That(_died, Is.False);
        }

        _lifeSystem.OnWrongAnswer();
        Assert.That(_died, Is.True);
        Assert.That(_lifeSystem.IsDead, Is.True);
    }

    [Test]
    public void CorrectAnswer_NeverRemovesAFeature()
    {
        _lifeSystem.OnCorrectAnswer();
        Assert.That(_lifeSystem.FeaturesRemaining, Is.EqualTo(8));
        Assert.That(_lostFeatures.Count, Is.EqualTo(0));
    }
}
