using System;

public class DoorController :
#if !UNITY_5_3_OR_NEWER
    UnityDummyMonoBehaviour
#else
    UnityEngine.MonoBehaviour
#endif
{
    public bool IsLocked { get; private set; } = true;
    public bool IsOpen { get; private set; } = false;

    private ChimeConductor? _chimeConductor;

    public DoorController() {}

    public DoorController(ChimeConductor? chimeConductor)
    {
        _chimeConductor = chimeConductor;
    }

    public void SetChimeConductor(ChimeConductor? chimeConductor)
    {
        _chimeConductor = chimeConductor;
    }

    public void OnAnswerSubmitted(TrialOutcome outcome)
    {
        if (outcome == TrialOutcome.Correct)
        {
            IsLocked = false;
            IsOpen = true;
            if (_chimeConductor != null)
            {
                _chimeConductor.PlaySuccessChime();
            }
        }
        else
        {
            IsLocked = true;
            IsOpen = false;
            if (_chimeConductor != null)
            {
                _chimeConductor.PlayFailureChime();
            }
        }
    }
}
