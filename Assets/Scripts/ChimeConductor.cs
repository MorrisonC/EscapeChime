using System;
using System.Collections;
using UnityEngine;

namespace RedInk
{
    public class ChimeConductor : MonoBehaviour
    {
        public static ChimeConductor Instance { get; private set; }

        public AudioSource audioSource;
        public AudioClip successClip;
        public AudioClip failureClip;

        public float noteInterval = 0.05f;

        public event Action<string, int, bool> OnNoteEntered;
        public event Action<string, int, bool> OnNoteExited;

        public AudioClip LastPlayedClip { get; private set; }
        public bool? LastPlayedIsSuccess { get; private set; }

        private static readonly string[] Notes = new[] { "G4", "E4", "C4" };

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                UnityEngine.Object.Destroy(gameObject);
                return;
            }
            Instance = this;

            if (audioSource == null)
            {
                audioSource = GetComponent<AudioSource>();
                if (audioSource == null)
                {
                    audioSource = gameObject.AddComponent<AudioSource>();
                }
            }
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public void PlaySuccessChime()
        {
            LastPlayedClip = successClip;
            LastPlayedIsSuccess = true;
            if (audioSource != null && successClip != null)
            {
                audioSource.PlayOneShot(successClip);
            }
            StartCoroutine(TriggerNoteEvents(true));
        }

        public void PlayFailureChime()
        {
            LastPlayedClip = failureClip;
            LastPlayedIsSuccess = false;
            if (audioSource != null && failureClip != null)
            {
                audioSource.PlayOneShot(failureClip);
            }
            StartCoroutine(TriggerNoteEvents(false));
        }

        private IEnumerator TriggerNoteEvents(bool isSuccess)
        {
            for (int i = 0; i < Notes.Length; i++)
            {
                OnNoteEntered?.Invoke(Notes[i], i, isSuccess);
                yield return new WaitForSeconds(noteInterval);
                OnNoteExited?.Invoke(Notes[i], i, isSuccess);
            }
        }
    }
}
