import IObjectInspector from "../IObjectInspector";
import { KeyDependency } from "../keyDependency";

type ObjectFound = (value: Object) => nullable<string>;
type KeyDependencyFound = (value: Object, keyDependency: KeyDependency) => void;
type ObjectFoundCallBack = (callBack: ObjectFound) => void;
type KeyDependencyFoundCallBack = (callBack: KeyDependencyFound) => void;

export class ObjectInspectorMock implements IObjectInspector {
    private _objectFoundCalls: ObjectFoundCallBack[] = [];
    private _keyDependencyFoundCalls: KeyDependencyFoundCallBack[] = [];

    inspectObject(value: Object, objectFound: ObjectFound, KeyDependencyFound: KeyDependencyFound): void {
        this._objectFoundCalls.forEach(callBack => callBack(objectFound));
        this._keyDependencyFoundCalls.forEach(callBack => callBack(KeyDependencyFound));
    }

    addObjectFoundCall(call: ObjectFoundCallBack): void {
        this._objectFoundCalls.push(call);
    }

    addKeyDependencyFoundCalls(...callBacks: KeyDependencyFoundCallBack[]): void {
        this._keyDependencyFoundCalls.push(...callBacks);
    }

}