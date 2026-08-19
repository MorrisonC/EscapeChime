using System.Collections.Generic;
using NUnit.Framework;
using RedInk;
using UnityEngine;

namespace RedInk.Tests.EditMode
{
    [TestFixture]
    public class LifeSystemTests
    {
        private GameObject go;
        private LifeSystem lifeSystem;

        [SetUp]
        public void SetUp()
        {
            go = new GameObject("LifeSystemHolder");
            lifeSystem = go.AddComponent<LifeSystem>();
        }

        [TearDown]
        public void TearDown()
        {
            if (go != null)
            {
                UnityEngine.Object.DestroyImmediate(go);
            }
        }

        [Test]
        public void WrongAnswer_RemovesExactlyOneFeature()
        {
            int initialLives = lifeSystem.RemainingLives;
            lifeSystem.RemoveNextFeature();

            Assert.That(lifeSystem.RemainingLives, Is.EqualTo(initialLives - 1));
            Assert.That(lifeSystem.MistakeCount, Is.EqualTo(1));
        }

        [Test]
        public void FeaturesAreLostInFixedOrder()
        {
            var lostFeatures = new List<FacialFeature>();
            lifeSystem.OnFeatureLost += (feat, index) => lostFeatures.Add(feat);

            for (int i = 0; i < LifeSystem.FixedFeatureOrder.Length; i++)
            {
                lifeSystem.RemoveNextFeature();
            }

            Assert.That(lostFeatures, Is.EqualTo(LifeSystem.FixedFeatureOrder));
        }

        [Test]
        public void EighthWrongAnswer_TriggersDeath()
        {
            int deathCallCount = 0;
            lifeSystem.OnDeath += () => deathCallCount++;

            for (int i = 0; i < 7; i++)
            {
                lifeSystem.RemoveNextFeature();
                Assert.That(lifeSystem.IsDead, Is.False, $"Died prematurely on mistake {i + 1}");
            }

            lifeSystem.RemoveNextFeature(); // 8th mistake

            Assert.That(lifeSystem.IsDead, Is.True);
            Assert.That(deathCallCount, Is.EqualTo(1));

            // Calling again after death should do nothing and not fire OnDeath again
            lifeSystem.RemoveNextFeature();
            Assert.That(deathCallCount, Is.EqualTo(1));
        }

        [Test]
        public void CorrectAnswer_NeverRemovesAFeature()
        {
            int initialLives = lifeSystem.RemainingLives;
            lifeSystem.RegisterCorrectAnswer();

            Assert.That(lifeSystem.RemainingLives, Is.EqualTo(initialLives));
            Assert.That(lifeSystem.MistakeCount, Is.EqualTo(0));
            Assert.That(lifeSystem.IsDead, Is.False);
        }
    }
}
