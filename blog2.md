Angular 2 is just completely revived framework.

Performance improvements:

Performance improved in Angular 2.0 as compared to Angular 1.x. Bootstrap is now platform specific in angular 2.o. So if application is bootstrap from browser it will call different bootstrap as compare to mobile app. So for browser bootstrap package:angular2/platform/browser.dart is used.

For mobile loading Apache Cordova can be used to reduce loading time.

Mobile Support:

Angular 1.x was made for responsive and two way binding app. There was no mobile support. Although there are other libraries which make angular 1.x run on mobile. Angular 2.0 is made keeping in mind mobile oriented architecture. There are libraries i.e. Native script which help mobile Angular 2 mobile development fast. Build Truly Native Mobile Apps with Angular | NativeScript. It also render same code in different way on browser as well as on mobile app.


TypeScript:

TypeScript(TS) is used heavily in Angular 2. Google currently using DART for coding. DART or TypeScript can be used for Angular 2. Learning TypeScript is very good since other frameworks and libraries i.e. REACTJS is also using TS. Hence if one can learn TS it’s very easily to implement REACTJS and other libraries in project.

If any developer is coming from JAVA, .NET background TypeScript is very easy to learn.

No $Scope in Angular 2:

Angular 2 is not using $scope anymore to glue view and controller. This is one of the biggest problem when you did coding in Angular 1 and then want to try Angular 2 for the project. However if anyone is coming from JAVA, .NET/ background can easily pick up because syntax are more similar to Java.

function($scope)
{
$scope.comparison =”Angular 1 vs Angular 2”
}
//is replaced by
constructor()
{
this.comparison =”Angular 1 vs Angular 2”
}
Component based Programming:

Just like ReactJs, AngularJs is also using component based programming. Component create less dependent and faster entities. I Angular 1 we have modular programming concept. Modular Programming was evolved from the fact that JQuery code were lot mess. Now component UI make component fast.

@Component({
 	selector: 'AngularComparison'
})
@View({
 templateUrl: './components/example/AngularComparison.html'
})
export class AngularComparison {
	constructor() {
		this.comparison= “Angular 1 vs Angular 2”;
	}
}
I have already explained benefits of component design in another thread. Why should ReactJS be used over any other client-side framework?

In React component creates virtual DOM. And this virtual DOM update itself with changing data.


Apart from this there are other improvement in brand new Angular 2 framework;

Injectors changed significantly. Child injectors is new thing in Angular 2.
There were bunch of directives in Angular 1. Angular 2 has only Component, Decorator and Template directive.
JSON based Route config is more easy to edit.