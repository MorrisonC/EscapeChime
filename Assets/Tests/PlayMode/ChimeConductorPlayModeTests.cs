using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using RedInk;
using UnityEngine;
using UnityEngine.TestTools;

namespace RedInk.Tests.PlayMode
{
    [TestFixture]
    public class ChimeConductorPlayModeTests
    {
        private GameObject go;
        private ChimeConductor conductor;

        [SetUp]
        public void SetUp()
        {
            go = new GameObject("ChimeConductorHolder");
            conductor = go.AddComponent<ChimeConductor>();
            conductor.noteInterval = 0.01f;

            conductor.successClip = AudioClip.Create("SuccessClip", 44100, 1, 44100, false);
            conductor.failureClip = AudioClip.Create("FailureClip", 44100, 1, 44100, false);
        }

        [TearDown]
        public void TearDown()
        {
            if (go != null)
            {
                UnityEngine.Object.DestroyImmediate(go);
            }
        }

#if UNITY_EDITOR
        [UnityTest]
        public IEnumerator PlaySuccessChime_FiresThreeNoteEventsInOrder()
        {
            var notesEntered = new List<string>();
            conductor.OnNoteEntered += (note, idx, isSuccess) => notesEntered.Add(note);

            conductor.PlaySuccessChime();

            yield return new WaitForSeconds(0.1f);

            Assert.That(notesEntered, Is.EqualTo(new[] { "G4", "E4", "C4" }));
            Assert.That(conductor.LastPlayedIsSuccess, Is.True);
        }

        [UnityTest]
        public IEnumerator PlayFailureChime_FiresThreeNoteEventsInOrder()
        {
            var notesEntered = new List<string>();
            conductor.OnNoteEntered += (note, idx, isSuccess) => notesEntered.Add(note);

            conductor.PlayFailureChime();

            yield return new WaitForSeconds(0.1f);

            Assert.That(notesEntered, Is.EqualTo(new[] { "G4", "E4", "C4" }));
            Assert.That(conductor.LastPlayedIsSuccess, Is.False);
        }
#else
        [Test]
        public void PlaySuccessChime_FiresThreeNoteEventsInOrder()
        {
            var notesEntered = new List<string>();
            conductor.OnNoteEntered += (note, idx, isSuccess) => notesEntered.Add(note);

            conductor.PlaySuccessChime();

            Assert.That(notesEntered, Is.EqualTo(new[] { "G4", "E4", "C4" }));
            Assert.That(conductor.LastPlayedIsSuccess, Is.True);
        }

        [Test]
        public void PlayFailureChime_FiresThreeNoteEventsInOrder()
        {
            var notesEntered = new List<string>();
            conductor.OnNoteEntered += (note, idx, isSuccess) => notesEntered.Add(note);

            conductor.PlayFailureChime();

            Assert.That(notesEntered, Is.EqualTo(new[] { "G4", "E4", "C4" }));
            Assert.That(conductor.LastPlayedIsSuccess, Is.False);
        }
#endif

        [Test]
        public void SuccessAndFailureChimes_UseDistinctAudioClips()
        {
            conductor.PlaySuccessChime();
            var successClip = conductor.LastPlayedClip;

            conductor.PlayFailureChime();
            var failureClip = conductor.LastPlayedClip;

            Assert.That(successClip, Is.Not.Null);
            Assert.That(failureClip, Is.Not.Null);
            Assert.That(successClip, Is.Not.EqualTo(failureClip));
        }
    }
}
