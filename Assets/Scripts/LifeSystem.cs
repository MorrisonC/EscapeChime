using System;

public enum RedactionFeature
{
    LeftEar,
    RightEar,
    LeftEyebrow,
    RightEyebrow,
    Nose,
    LeftEye,
    RightEye,
    Mouth
}

public class LifeSystem
{
    public int FeaturesRemaining { get; private set; } = 8;
    public bool IsDead => FeaturesRemaining <= 0;

    public event Action<RedactionFeature>? OnFeatureLost;
    public event Action? OnDeath;

    public void OnWrongAnswer()
    {
        if (IsDead) return;

        FeaturesRemaining--;
        RedactionFeature lostFeature = GetFeatureForStage(8 - FeaturesRemaining);

        OnFeatureLost?.Invoke(lostFeature);

        if (FeaturesRemaining == 0)
        {
            OnDeath?.Invoke();
        }
    }

    public void OnCorrectAnswer()
    {
        // Does nothing to features
    }

    private RedactionFeature GetFeatureForStage(int stage)
    {
        switch (stage)
        {
            case 1: return RedactionFeature.LeftEar;
            case 2: return RedactionFeature.RightEar;
            case 3: return RedactionFeature.LeftEyebrow;
            case 4: return RedactionFeature.RightEyebrow;
            case 5: return RedactionFeature.Nose;
            case 6: return RedactionFeature.LeftEye;
            case 7: return RedactionFeature.RightEye;
            case 8: return RedactionFeature.Mouth;
            default: throw new ArgumentOutOfRangeException();
        }
    }
}
