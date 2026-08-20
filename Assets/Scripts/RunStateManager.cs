using System;

public class RunSummaryPayload
{
    public int Seed { get; set; }
    public int RoomsCleared { get; set; }
    public int MistakesMade { get; set; }
    public bool Won { get; set; }
}

public class RunStateManager
{
    public int Seed { get; private set; }
    public int TotalRoomsPlanned { get; private set; }
    public int CurrentRoomIndex { get; private set; }
    public int RoomsCleared { get; private set; }
    public int MistakesMade { get; private set; }

    public bool IsRunActive { get; private set; }
    public bool IsWin { get; private set; }
    public bool IsDeath => LifeSystem != null && LifeSystem.IsDead;

    public LifeSystem LifeSystem { get; private set; }

    public RunStateManager(int seed, int totalRoomsPlanned, LifeSystem? lifeSystem = null)
    {
        Seed = seed;
        TotalRoomsPlanned = totalRoomsPlanned > 0 ? totalRoomsPlanned : 10;
        CurrentRoomIndex = 0;
        RoomsCleared = 0;
        MistakesMade = 0;
        IsRunActive = true;
        IsWin = false;

        LifeSystem = lifeSystem ?? new LifeSystem();
        LifeSystem.OnDeath += HandleDeath;
    }

    public void OnRoomCleared()
    {
        if (!IsRunActive) return;

        RoomsCleared++;
        CurrentRoomIndex++;

        if (RoomsCleared >= TotalRoomsPlanned)
        {
            IsRunActive = false;
            IsWin = true;
        }
    }

    public void OnMistakeMade()
    {
        if (!IsRunActive) return;

        MistakesMade++;
        LifeSystem.OnWrongAnswer();
    }

    private void HandleDeath()
    {
        IsRunActive = false;
        IsWin = false;
    }

    public RunSummaryPayload GenerateSummaryPayload()
    {
        return new RunSummaryPayload
        {
            Seed = Seed,
            RoomsCleared = RoomsCleared,
            MistakesMade = MistakesMade,
            Won = IsWin
        };
    }
}
