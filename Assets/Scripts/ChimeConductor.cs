using System;
using System.Collections.Generic;

#if !UNITY_5_3_OR_NEWER
public class UnityDummyMonoBehaviour {}
public class UnityDummyAudioClip { public string name; public UnityDummyAudioClip(string n) { name = n; } }
public class UnityDummyAudioSource
{
    public UnityDummyAudioClip clip;
    public void Play() {}
}
#endif

public class ChimeConductor :
#if !UNITY_5_3_OR_NEWER
    UnityDummyMonoBehaviour
#else
    UnityEngine.MonoBehaviour
#endif
{
#if !UNITY_5_3_OR_NEWER
    public UnityDummyAudioSource audioSource;
    public UnityDummyAudioClip successClip;
    public UnityDummyAudioClip failureClip;
#else
    public UnityEngine.AudioSource audioSource;
    public UnityEngine.AudioClip successClip;
    public UnityEngine.AudioClip failureClip;
#endif

    public event Action<string> OnNoteEntered;
    public event Action<string> OnNoteExited;

    public List<string> PlayedNotes { get; private set; } = new List<string>();

    public void PlaySuccessChime()
    {
        if (audioSource != null && successClip != null)
        {
            audioSource.clip = successClip;
            audioSource.Play();
        }

        PlayedNotes.Clear();
        TriggerNote("G4");
        TriggerNote("E4");
        TriggerNote("C4");
    }

    public void PlayFailureChime()
    {
        if (audioSource != null && failureClip != null)
        {
            audioSource.clip = failureClip;
            audioSource.Play();
        }

        PlayedNotes.Clear();
        TriggerNote("G4_detuned");
        TriggerNote("E4_detuned");
        TriggerNote("C4_detuned");
    }

    private void TriggerNote(string note)
    {
        PlayedNotes.Add(note);
        OnNoteEntered?.Invoke(note);
        OnNoteExited?.Invoke(note);
    }
}
