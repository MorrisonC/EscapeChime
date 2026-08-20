using System;
using System.Collections.Generic;
using NUnit.Framework;

[TestFixture]
public class ProceduralRunGeneratorTests
{
    private GrammarQuestionBank _bank;
    private ProceduralRunGenerator _generator;

    [SetUp]
    public void SetUp()
    {
        _bank = GrammarQuestionBank.CreateSeedContentSet();
        _generator = new ProceduralRunGenerator();
    }

    [Test]
    public void SameSeed_ProducesIdenticalRoomOrder()
    {
        int seed = 12345;
        int roomCount = 10;

        Room[] run1 = _generator.GenerateRun(_bank, seed, roomCount);
        Room[] run2 = _generator.GenerateRun(_bank, seed, roomCount);

        Assert.That(run1.Length, Is.EqualTo(roomCount));
        Assert.That(run2.Length, Is.EqualTo(roomCount));

        for (int i = 0; i < roomCount; i++)
        {
            Assert.That(run1[i].Question.id, Is.EqualTo(run2[i].Question.id));
        }
    }

    [Test]
    public void DifferentSeeds_ProduceDifferentRoomOrder()
    {
        int roomCount = 10;
        List<string> runSignatures = new List<string>();

        for (int seed = 1; seed <= 20; seed++)
        {
            Room[] run = _generator.GenerateRun(_bank, seed, roomCount);
            string sig = string.Join(",", System.Array.ConvertAll(run, r => r.Question.id));
            runSignatures.Add(sig);
        }

        HashSet<string> uniqueSignatures = new HashSet<string>(runSignatures);
        Assert.That(uniqueSignatures.Count, Is.GreaterThan(15));
    }

    [Test]
    public void NoDuplicateRuleFamilyWithinSingleRun()
    {
        int seed = 999;
        int roomCount = 10;

        Room[] run = _generator.GenerateRun(_bank, seed, roomCount);
        HashSet<string> seenFamilies = new HashSet<string>();

        foreach (var room in run)
        {
            Assert.That(seenFamilies.Contains(room.Question.ruleFamily), Is.False);
            seenFamilies.Add(room.Question.ruleFamily);
        }
    }

    [Test]
    public void RequestedRoomCount_MatchesGeneratedCount()
    {
        int roomCount = 8;
        Room[] run = _generator.GenerateRun(_bank, 42, roomCount);
        Assert.That(run.Length, Is.EqualTo(roomCount));

        Assert.Throws<ArgumentException>(() =>
        {
            _generator.GenerateRun(_bank, 42, 100);
        });
    }

    [Test]
    public void EveryGeneratedRoom_HasValidQuestionData()
    {
        Room[] run = _generator.GenerateRun(_bank, 777, 10);
        foreach (var room in run)
        {
            Assert.That(room.Question.correctAnswer, Is.Not.Null.And.Not.Empty);
            Assert.That(room.Question.distractors, Is.Not.Null.And.Not.Empty);
            Assert.That(room.Question.template, Does.Contain("{blank}"));
        }
    }
}
