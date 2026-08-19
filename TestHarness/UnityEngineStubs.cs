using System;
using System.Collections;
using System.Collections.Generic;

namespace UnityEngine
{
    public class Object
    {
        public string name { get; set; }
        public static void Destroy(Object obj)
        {
            DestroyImmediate(obj);
        }

        public static void DestroyImmediate(Object obj)
        {
            if (obj is GameObject go)
            {
                foreach (var c in go.GetComponents<Component>())
                {
                    var onDestroy = c.GetType().GetMethod("OnDestroy", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
                    onDestroy?.Invoke(c, null);
                }
            }
            else if (obj is Component comp)
            {
                var onDestroy = comp.GetType().GetMethod("OnDestroy", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
                onDestroy?.Invoke(comp, null);
            }
        }
    }

    public class ScriptableObject : Object
    {
        public static T CreateInstance<T>() where T : ScriptableObject, new()
        {
            return new T();
        }
    }

    [AttributeUsage(AttributeTargets.Class)]
    public class CreateAssetMenuAttribute : Attribute
    {
        public string fileName { get; set; }
        public string menuName { get; set; }
    }

    public class GameObject : Object
    {
        private List<Component> _components = new List<Component>();

        public GameObject() { }
        public GameObject(string name) { this.name = name; }

        public T AddComponent<T>() where T : Component, new()
        {
            var comp = new T();
            comp.gameObject = this;
            _components.Add(comp);
            if (comp is MonoBehaviour mb)
            {
                mb.InvokeAwake();
            }
            return comp;
        }

        public T GetComponent<T>() where T : Component
        {
            foreach (var c in _components)
            {
                if (c is T match) return match;
            }
            return null;
        }

        public T[] GetComponents<T>() where T : Component
        {
            var result = new List<T>();
            foreach (var c in _components)
            {
                if (c is T match) result.Add(match);
            }
            return result.ToArray();
        }
    }

    public class Component : Object
    {
        public GameObject gameObject { get; internal set; }
        public T GetComponent<T>() where T : Component
        {
            return gameObject?.GetComponent<T>();
        }
        public T AddComponent<T>() where T : Component, new()
        {
            return gameObject?.AddComponent<T>();
        }
    }

    public class MonoBehaviour : Component
    {
        internal void InvokeAwake()
        {
            var awakeMethod = GetType().GetMethod("Awake", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
            awakeMethod?.Invoke(this, null);
        }

        public Coroutine StartCoroutine(IEnumerator routine)
        {
            if (routine != null)
            {
                while (routine.MoveNext())
                {
                    if (routine.Current is IEnumerator nested)
                    {
                        StartCoroutine(nested);
                    }
                }
            }
            return new Coroutine();
        }
    }

    public class Coroutine { }

    public class WaitForSeconds
    {
        public float Seconds { get; }
        public WaitForSeconds(float seconds) { Seconds = seconds; }
    }

    public class AudioClip : Object
    {
        public static AudioClip Create(string name, int lengthSamples, int channels, int frequency, bool stream)
        {
            return new AudioClip { name = name };
        }
    }

    public class AudioSource : Component
    {
        public void PlayOneShot(AudioClip clip) { }
    }
}

namespace UnityEngine.TestTools
{
    [AttributeUsage(AttributeTargets.Method)]
    public class UnityTestAttribute : NUnit.Framework.TestAttribute
    {
    }
}
