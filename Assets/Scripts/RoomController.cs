using System;

public class RoomController :
#if !UNITY_5_3_OR_NEWER
    UnityDummyMonoBehaviour
#else
    UnityEngine.MonoBehaviour
#endif
{
    public Room? CurrentRoom { get; private set; }
    public GrammarQuestion? CurrentQuestion { get; private set; }

    public TrialResolver? TrialResolver { get; private set; }
    public DoorController? DoorController { get; private set; }
    public RunStateManager? RunStateManager { get; private set; }

    public RoomController() {}

    public RoomController(TrialResolver trialResolver, DoorController doorController, RunStateManager runStateManager)
    {
        Initialize(trialResolver, doorController, runStateManager);
    }

    public void Initialize(TrialResolver trialResolver, DoorController doorController, RunStateManager runStateManager)
    {
        TrialResolver = trialResolver ?? throw new ArgumentNullException(nameof(trialResolver));
        DoorController = doorController ?? throw new ArgumentNullException(nameof(doorController));
        RunStateManager = runStateManager ?? throw new ArgumentNullException(nameof(runStateManager));
    }

    public void EnterRoom(Room room)
    {
        CurrentRoom = room ?? throw new ArgumentNullException(nameof(room));
        CurrentQuestion = room.Question ?? throw new ArgumentException("Room has null Question", nameof(room));

        TrialResolver?.OnEnterNewRoom();
    }

    public TrialResult SubmitAnswer(string answer)
    {
        if (CurrentQuestion == null)
            throw new InvalidOperationException("No active question in current room.");

        if (TrialResolver == null)
            throw new InvalidOperationException("TrialResolver is not initialized.");

        TrialResult result = TrialResolver.Resolve(CurrentQuestion, answer);

        DoorController?.OnAnswerSubmitted(result.Outcome);

        if (result.Outcome == TrialOutcome.Correct)
        {
            RunStateManager?.OnRoomCleared();
        }
        else
        {
            RunStateManager?.OnMistakeMade();
            CurrentQuestion = result.NextQuestion;
        }

        return result;
    }
}
