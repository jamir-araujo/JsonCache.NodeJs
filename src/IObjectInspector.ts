import { KeyDependency } from "./keyDependency";

type ObjectFound = (value: Object) => nullable<string>;
type KeyDependencyFound = (value: Object, keyDependency: KeyDependency) => void;

export default interface IObjectInspector {
    inspectObject(value: Object, objectFound: ObjectFound, KeyDependencyFound: KeyDependencyFound): void;
}