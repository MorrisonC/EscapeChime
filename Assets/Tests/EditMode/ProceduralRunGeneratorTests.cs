using System;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using RedInk;

namespace RedInk.Tests.EditMode
{
    [TestFixture]
    public class ProceduralRunGeneratorTests
    {
        private GrammarQuestionBank bank;

        [SetUp]
        public void SetUp()
        {
            bank = GrammarQuestionBank.CreateDefaultBank();
        }

        [Test]
        public void SameSeed_ProducesIdenticalRoomOrder()
        {
            int seed = 12345;
            int roomCount = 10;

            var run1 = ProceduralRunGenerator.GenerateRun(bank, seed, roomCount);
            var run2 = ProceduralRunGenerator.GenerateRun(bank, seed, roomCount);

            Assert.That(run1.Count, Is.EqualTo(roomCount));
            Assert.That(run2.Count, Is.EqualTo(roomCount));

            for (int i = 0; i < roomCount; i++)
            {
                Assert.That(run1[i].question.id, Is.EqualTo(run2[i].question.id));
                Assert.That(run1[i].selectedTemplateIndex, Is.EqualTo(run2[i].selectedTemplateIndex));
                Assert.That(run1[i].shuffledOptions, Is.EqualTo(run2[i].shuffledOptions));
            }
        }

        [Test]
        public void DifferentSeeds_ProduceDifferentRoomOrder()
        {
            int roomCount = 10;
            var seedRuns = new Dictionary<int, string>();

            for (int seed = 1; seed <= 20; seed++)
            {
                var run = ProceduralRunGenerator.GenerateRun(bank, seed, roomCount);
                string key = string.Join(",", run.Select(r => r.question.id));

                Assert.That(seedRuns.ContainsValue(key), Is.False, $"Seed {seed} produced duplicate room order matching a prior seed.");
                seedRuns[seed] = key;
            }
        }

        [Test]
        public void NoDuplicateRuleFamilyWithinSingleRun()
        {
            int seed = 999;
            int roomCount = 10;

            var run = ProceduralRunGenerator.GenerateRun(bank, seed, roomCount);
            var ruleFamilies = run.Select(r => r.question.ruleFamily).ToList();
            var distinctFamilies = ruleFamilies.Distinct().ToList();

            Assert.That(ruleFamilies.Count, Is.EqualTo(distinctFamilies.Count), "A rule family appeared twice within the same initial room plan.");
        }

        [Test]
        public void RequestedRoomCount_MatchesGeneratedCount()
        {
            int seed = 42;
            int requestedCount = 12;

            var run = ProceduralRunGenerator.GenerateRun(bank, seed, requestedCount);
            Assert.That(run.Count, Is.EqualTo(requestedCount));

            Assert.That(() => ProceduralRunGenerator.GenerateRun(bank, seed, 100), Throws.InstanceOf<ArgumentOutOfRangeException>());
        }

        [Test]
        public void EveryGeneratedRoom_HasValidQuestionData()
        {
            int seed = 777;
            var run = ProceduralRunGenerator.GenerateRun(bank, seed, 10);

            foreach (var room in run)
            {
                Assert.That(room.question.correctAnswer, Is.Not.Null.And.Not.Empty);
                Assert.That(room.shuffledOptions, Is.Not.Null.And.Not.Empty);
                Assert.That(room.selectedTemplate, Contains.Substring("{blank}"));
                Assert.That(room.shuffledOptions.Contains(room.question.correctAnswer), Is.True);
            }
        }
    }
}
