using System.Collections.Generic;
using NUnit.Framework;

[TestFixture]
public class GrammarQuestionBankValidationTests
{
    private GrammarQuestionBank _bank;

    [SetUp]
    public void SetUp()
    {
        _bank = GrammarQuestionBank.CreateSeedContentSet();
    }

    [Test]
    public void EveryQuestion_HasNonNullCorrectAnswer()
    {
        foreach (var family in _bank.ruleFamilies)
        {
            foreach (var template in family.templates)
            {
                Assert.That(template.correctAnswer, Is.Not.Null.And.Not.Empty);
            }
        }
    }

    [Test]
    public void EveryQuestion_CorrectAnswerIsNotAlsoListedAsDistractor()
    {
        foreach (var family in _bank.ruleFamilies)
        {
            foreach (var template in family.templates)
            {
                Assert.That(template.distractors, Does.Not.Contain(template.correctAnswer));
            }
        }
    }

    [Test]
    public void EveryQuestion_TemplateContainsBlankToken()
    {
        foreach (var family in _bank.ruleFamilies)
        {
            foreach (var template in family.templates)
            {
                Assert.That(template.template, Does.Contain("{blank}"));
            }
        }
    }

    [Test]
    public void EveryRuleFamily_HasAtLeastMinimumTemplateCount()
    {
        foreach (var family in _bank.ruleFamilies)
        {
            Assert.That(family.templates.Count, Is.GreaterThanOrEqualTo(3));
        }
    }

    [Test]
    public void EveryCategory_HasAtLeastMinimumRuleFamilyCount()
    {
        Dictionary<string, int> categoryCounts = new Dictionary<string, int>();
        foreach (var family in _bank.ruleFamilies)
        {
            if (!categoryCounts.ContainsKey(family.category))
                categoryCounts[family.category] = 0;
            categoryCounts[family.category]++;
        }

        Assert.That(categoryCounts.Count, Is.GreaterThanOrEqualTo(5));
        foreach (var kvp in categoryCounts)
        {
            Assert.That(kvp.Value, Is.GreaterThanOrEqualTo(8));
        }
    }

    [Test]
    public void BankHasAllRequiredCategoriesFromGDD()
    {
        HashSet<string> categories = new HashSet<string>();
        foreach (var family in _bank.ruleFamilies)
        {
            categories.Add(family.category);
        }

        Assert.That(categories, Does.Contain("Homophones"));
        Assert.That(categories, Does.Contain("CommonlyConfused"));
        Assert.That(categories, Does.Contain("Apostrophes"));
        Assert.That(categories, Does.Contain("SubjectVerbAgreement"));
        Assert.That(categories, Does.Contain("Punctuation"));
    }

    [Test]
    public void NoDuplicateQuestionIDsInBank()
    {
        HashSet<string> seenIds = new HashSet<string>();
        foreach (var family in _bank.ruleFamilies)
        {
            foreach (var template in family.templates)
            {
                Assert.That(seenIds.Contains(template.id), Is.False, $"Duplicate question ID found: {template.id}");
                seenIds.Add(template.id);
            }
        }
    }
}
