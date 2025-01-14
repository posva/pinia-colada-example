import {
  computed,
  nextTick,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type UnwrapRef,
  type WritableComputedRef,
} from 'vue'
import {
  type LocationQuery,
  type LocationQueryRaw,
  type LocationQueryValue,
  type LocationQueryValueRaw,
  useRoute,
  useRouter,
} from 'vue-router'

const PENDING_QUERY_KEY = Symbol('pending-query')
declare module 'vue-router' {
  interface Router {
    /**
     * Allows pending queries to not be shared in SSR.
     * @internal
     */
    [PENDING_QUERY_KEY]: null | undefined | LocationQueryRaw
  }
}

export interface UseRouteQueryValueOptions<T> {
  /**
   * Parses the raw value from the query into the desired type. By default, it handles natively strings, numbers and booleans, everything else is parsed as JSON.
   *
   * @param rawValue - The raw value from the query
   */
  parse?: (rawValue: LocationQueryValue | LocationQueryValue[]) => T

  /**
   * Serializes the value into a string that can be used in the query. By default, it uses `JSON.stringify` for objects and arrays, and `toString` for everything else.
   *
   * @param parsedValue - parsed value as returned by `parse` or set by the user
   */
  serialize?: (
    parsedValue: UnwrapRef<T> | undefined
  ) => LocationQueryValueRaw | LocationQueryValueRaw[]

  /**
   * Deletes the value from the query if it returns `true`. By default, it deletes the value if it is `null` or `undefined`.
   *
   * @param parsedValue - value to check if it should be deleted from the query
   */
  deleteIf?: (parsedValue: UnwrapRef<T> | undefined | null) => boolean
}

// TODO: how faster is to use startsWith twice
const IS_JSON_REGEX = /(?:^[{[]|^[1-9]\d*$)/

const DEFAULT_PARSER = <T>(
  rawValue: LocationQueryValue | LocationQueryValue[]
): T =>
  // run the arrays through the parser again
  Array.isArray(rawValue)
    ? rawValue.map(DEFAULT_PARSER)
    : rawValue &&
        (IS_JSON_REGEX.test(rawValue) ||
          rawValue === 'false' ||
          rawValue === 'true' ||
          rawValue === 'null')
      ? JSON.parse(rawValue)
      : rawValue // just the string

const DEFAULT_SERIALIZER = <T>(
  parsedValue: T
): LocationQueryValueRaw | LocationQueryValueRaw[] =>
  Array.isArray(parsedValue)
    ? (parsedValue.map(DEFAULT_SERIALIZER) as LocationQueryValueRaw[])
    : parsedValue == null
      ? null
      : typeof parsedValue === 'object'
        ? JSON.stringify(parsedValue)
        : parsedValue.toString()

export const DEFAULT_OPTIONS = {
  parse: DEFAULT_PARSER,
  serialize: DEFAULT_SERIALIZER,
  deleteIf: <T>(v: T) => v == null,
} satisfies UseRouteQueryValueOptions<
  null | undefined | Record<string, unknown> | number | string | unknown[]
>

export function useRouteQueryValue<T extends string>(
  name: string,
  defaultValue?: T,
  // optional for strings
  options?: UseRouteQueryValueOptions<T>
): Ref<UnwrapRef<T>>
export function useRouteQueryValue<T>(
  name: string,
  // required for anything else
  defaultValue: MaybeRefOrGetter<T>,
  options?: UseRouteQueryValueOptions<T>
): Ref<UnwrapRef<T>>
export function useRouteQueryValue<T>(
  name: string,
  defaultValue?: MaybeRefOrGetter<T>,
  options?: UseRouteQueryValueOptions<T>
): Ref<UnwrapRef<T> | undefined> {
  const $route = useRoute()
  const $router = useRouter()

  const { parse, serialize, deleteIf } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  const queryValue = ref<T | undefined>(
    name in $route.query ? parse($route.query[name]) : toValue(defaultValue)
  )

  watch(
    () => parse($route.query[name]),
    (value) => {
      console.log(`parsed value`, value)
      queryValue.value = value as UnwrapRef<T>
    }
  )

  watch(
    queryValue,
    (value, oldValue) => {
      console.log(`queryValue change`, name, value)
      // the whole value was replaced with the watcher above
      // so we the route is already up to date
      if (value !== oldValue) return

      const newQuery = $router[PENDING_QUERY_KEY] || { ...$route.query }

      if (deleteIf(value)) {
        delete newQuery[name]
        console.log('deleted value', name)
      } else {
        newQuery[name] = serialize(value)
        console.log('serialized value', name, newQuery[name])
      }

      // only setups the push once
      if (!$router[PENDING_QUERY_KEY]) {
        $router[PENDING_QUERY_KEY] = newQuery
        nextTick().then(() => {
          $router.push({ query: $router[PENDING_QUERY_KEY]! })
          $router[PENDING_QUERY_KEY] = null
        })
      }
    },
    { deep: true }
  )

  return queryValue
}

interface UseRouteQueryOptions<T extends Record<string, unknown>> {
  parse?: (rawValue: LocationQuery) => Partial<T>

  serialize?: (parsedValue: Partial<T>) => LocationQueryRaw

  // deleteIf?: <K extends keyof T>(parsedValue: T[NoInfer<K>], key: K) => boolean

  deleteIf?: (...args: ValueAndKeys<T>) => boolean
}

type ValueAndKeys<T> = {
  [P in keyof Required<T>]: [value: T[P] | undefined, key: P]
}[keyof T]

type A = ValueAndKeys<{ a?: string; b: { t: string } }>
interface TestAFn {
  (...args: A): void
}

const b: TestAFn = (value, key) => {
  if (key === 'a') {
    value
  } else if (key === 'b') {
    value?.t
  }
}

function parseQueryObject(rawValue: LocationQuery): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in rawValue) {
    const val = rawValue[key]
    result[key] = Array.isArray(val)
      ? val.map((v) => v && JSON.parse(v))
      : val && JSON.parse(val)
  }
  return result
}

function serializeQueryObject(
  parsedValue: Record<string, unknown>
): LocationQueryRaw {
  const result: LocationQueryRaw = {}
  for (const key in parsedValue) {
    const val = parsedValue[key]
    result[key] = Array.isArray(val)
      ? val.map((v) => JSON.stringify(v))
      : JSON.stringify(val)
  }
  return result
}

export const DEFAULT_OPTIONS_O = {
  parse: parseQueryObject,
  serialize: serializeQueryObject,
  deleteIf: (value, _key) => value === undefined || value === '',
} satisfies UseRouteQueryOptions<Record<string, unknown>>

type EmptyFields<T> = {
  [K in keyof T]-?: T[K] | undefined
}

type WithUndefined<T> = {
  [P in keyof T]: T[P] | undefined
}

type C = Required<{ a?: string; b: number }>

// inline
type B1 = EmptyFields<Required<{ a?: string; b: number }>>
type B2 = WithUndefined<{ a?: string; b: number }>
type B4 = WithUndefined<Required<{ a?: string; b: number }>>
type B3 = EmptyFields<{ a: string; b: number }>

type OriginalSemi = { a?: string; b: number }
type OriginalReq = { a: string; b: number }
type OriginalPartial = { a?: string; b?: number }

type C1 = EmptyFields<OriginalSemi>
type C2 = EmptyFields<OriginalReq> // Correct
type C3 = EmptyFields<OriginalPartial>

type OriginalReqWithPartial = Partial<OriginalReq>
type D1 = EmptyFields<OriginalReqWithPartial>
type OriginalPartialWithReq = Required<OriginalPartial>
type D2 = EmptyFields<OriginalPartialWithReq> // bugged

export function useRouteQuery<T extends Record<string, unknown>>(
  defaultValue: WithUndefined<T> | (() => WithUndefined<T>),
  options?: UseRouteQueryOptions<NoInfer<T>>
): Ref<WithUndefined<T>> {
  const $route = useRoute()
  const $router = useRouter()

  const { parse, serialize, deleteIf } = {
    ...(DEFAULT_OPTIONS_O as Required<UseRouteQueryOptions<T>>),
    ...options,
  }

  // we do this once to have the keys
  const initialValues = toValue(defaultValue)

  const queryValue = ref<WithUndefined<T>>(
    {
      ...initialValues,
      ...parse(pickFrom($route.query, initialValues)),
    }
    // users are not meant to use nested refs or nested reactive objects
    // and this greatly simplify types
  ) as Ref<WithUndefined<T>>

  watch(
    () => ({
      ...toValue(defaultValue),
      ...parse(pickFrom($route.query, initialValues)),
    }),
    (value) => {
      console.log(`parsed value`, value)
      queryValue.value = value
    }
  )

  watch(
    queryValue,
    (value, oldValue) => {
      console.log(`queryValue change`, value)
      // the whole value was replaced with the watcher above
      // so we the route is already up to date
      if (value !== oldValue) return

      const newQuery = $router[PENDING_QUERY_KEY] || { ...$route.query }

      // add our query to the pending query
      Object.assign(newQuery, serialize(value))

      // delete any keys meant to be deleted
      for (const key in initialValues) {
        if (deleteIf(value[key], key)) {
          delete newQuery[key]
          console.log('deleted value', key)
        }
      }

      // only setups the push once
      if (!$router[PENDING_QUERY_KEY]) {
        $router[PENDING_QUERY_KEY] = newQuery
        nextTick().then(() => {
          $router.push({ query: $router[PENDING_QUERY_KEY]! })
          $router[PENDING_QUERY_KEY] = null
        })
      }
    },
    { deep: true }
  )

  return queryValue
}

function pickFrom<
  T extends Record<string, unknown>,
  K extends Record<keyof T, unknown>,
>(obj: T, keysOf: K): Pick<T, Extract<keyof K, string>> {
  const result = {} as Pick<T, Extract<keyof K, string>>
  for (const key in keysOf) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }

  return result
}
