#Author: Connor P. Bain
#Code for CockyReaders server-side
#Last modified December 3, 2014

import logging
import webapp2
import jinja2
import os
import json

from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api.validation import Repeated

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"))
Host = "HTTP://localhost:8080/"
class MainPage(webapp2.RequestHandler):        
    def setupUser(self): 
            self.template_values = {}
            self.currentUser = users.get_current_user()  
            self.template_values['user'] = self.currentUser
            if self.currentUser:
                self.template_values['login'] = users.create_logout_url("/")
            else:
                self.template_values['login'] = users.create_login_url(self.request.uri)
       
    def setupJSON(self, objID):
        self.json = False
        if (self.request.get('fmt') == 'json'):
            self.json = True
        if ('json' in self.request.path.split('.')):
            objID = objID.split('.')[0]
            self.json = True  
        return objID
        
    def render(self, loadTemplate):
        template = jinja_environment.get_template(loadTemplate)   
        self.response.out.write(template.render(self.template_values))  
    
    def get(self):
        self.setupUser();             
        self.template_values['title'] = "Administrator View"
        self.render("main.html")    
        
    def getStudent(self, studentID):
        key = db.Key.from_path('Student', long(studentID))
        theStudent = db.get(key)
        if theStudent == None:
            self.redirect('/')
            return None
        return theStudent   
#class for login side of the app        
class LoginHandler(MainPage):
    def get(self):
        loginUser = self.request.get('user')
        loginPassword = self.request.get('password')
            
        #demo user
        query = Student.all()
        if query.count() == 0:
            newStudent = Student(key_name= 1,firstName="temp", lastName="temp", userName="theFirst", password="password", books=[1113,1114])
            newStudent.put()
        #this does now work properly unless the key_name of each entry is that of the UserName
        #currently the key_name is the student id		
        #key = db.Key.from_path('Student', loginUser )
        #theStudent = db.get(key)
        q = db.GqlQuery("SELECT * FROM Student " + "WHERE userName = :1"+"WHERE password = :2",loginUser,loginPassword)
		
        self.response.headers.add_header('Access-Control-Allow-Origin', '*')
        self.response.out.headers['Content-Type'] = "text/json"
		if q.count() == 0:
           self.response.out.write("Failure")
        else:
            self.response.out.write("Success")
    def post(self):
        newUserName = self.request.get('user')
        newUserPassword = self.request.get('password')
        newUserFirstName = self.request.get('firstName')
        newUserlastName = self.request.get('lastName')
        newUserTeacher = self.request.get('teacher')
        newUserGrade = self.request.get('grade')
        newUserPin = self.request.get('pinNumber')
        self.response.headers.add_header('Access-Control-Allow-Origin', '*')
        self.response.out.headers['Content-Type'] = "text/json"
        q = db.GqlQuery("SELECT * FROM Student " + "WHERE userName = :1",newUserName)
        if q.count() >= 1:
            #return error that this invalid
            self.response.out.write("Failure")
            logging.debug("invalid user being added")
        else:
            #if error here, remove the int cast and just let the userpin be a string
            newUser = student(key_name=int(newUserPin),firstName = newUserFirstName,lastname = newUserLastName, userName = newUserName, password = newUserPassword
                          teacher=newUserteacher,grade = int(newUserGrade),books=[1113,1114])
            #compare USerName and return if invalid  
            newUser.put()
            #for setting up users
            self.response.out.write("Success")
class BookHandler(MainPage):
    def get(self, bookID):   
        self.setupUser()
        self.setupJSON(bookID)
        loginUser = self.request.get('user')
        logging.debug("value of my var is %s", str(loginUser))
        query = Student.all()
        if (query.count() == 0):
            newStudent = Student(firstName="temp", lastName="temp", userName="theFirst", password="password", books= [1113,1114])
            newStudent.put()
        q = db.GqlQuery("SELECT * FROM Student " + "WHERE userName = :1",loginUser)
        theStudent = Student()
        for p in q.run(limit=1):
            theStudent = p
        if theStudent == None:
		    libaryList = [1113,1114,1115]
        else:	
            libaryList = theStudent.books
        query = Book.all()
        #DEMO CODE
        if query.count() == 0:
            newBook = Book(title = "Sleeping Beauty", genre = "Fantasy", isbn = int(1113), cover = Host+"/libary/1113",link = Host+"/libary/1115")
            newBook.put()
        
            newBook = Book(title = "Moby Dick", genre = "Fantasy", isbn = int(1114), cover = Host+"/libary/1114",link = Host+"/libary/1114")
            newBook.put()
 
            newBook = Book(title = "Where The Wild Things Are", genre = "Fantasy", isbn = int(1115), cover = Host+"/libary/1115" , link = Host+"/libary/1115")
            newBook.put()
            
            query = Book.all()
        
        if self.json:
            self.response.headers.add_header('Access-Control-Allow-Origin', '*')
            self.response.out.headers['Content-Type'] = "text/json"
            books = []
            #look through the books based on the isbn number
            for isbnN in libaryList:
                q = db.GqlQuery("SELECT * FROM Book " + "WHERE isbn = :1",int(isbnN))
                for book in q.run(limit=1):
				   books.append(book.dict())
            self.response.out.write(json.dumps(books))
            return       
        
class UserMangament(MainPage):
    def get(self):
    def post(self):	
class LibaryHandler(MainPage):
    def get(self):
    def post(self):	
class StudentHandler(MainPage):
    def get(self, studentID):
        self.setupUser()
                
        query = Student.all()
        logging.info(query.count())
                              
        self.template_values['students'] = query
        self.template_values['title'] = 'Your Students'
        self.render('studentlist.html')
        return
        
    def post(self, studentID):
        self.setupUser()
       
        fName = self.request.get('firstName')
        lName = self.request.get('lastName')
        teacher = self.request.get('teacher')
        grade = self.request.get('grade')

        newStudent = Student(firstName = fName, lastName = lName, teacher = teacher, grade = int(grade),books=[1113,1114] pagesRead = 0)
        newStudent.put()
        
        self.redirect('/student')            
        return
            
class Student(db.Model):
    firstName = db.StringProperty()
    lastName = db.StringProperty()
    teacher = db.StringProperty()
    grade = db.IntegerProperty()
    userName = db.StringProperty()
    pagesRead = db.IntegerProperty()
    wordsDefined = db.IntegerProperty()
    timeReading = db.IntegerProperty()
    
    password = db.StringProperty()
    books = db.ListProperty(long)
    
    def id(self):
        return self.key().id()
    
    def dict(self):
        theStudentDict = {}
        theStudentDict['id'] = self.id()
        theStudentDict['firstName'] = self.firstName
        theStudentDict['lastName'] = self.lastName
        theStudentDict['teacher'] = self.teacher
        theStudentDict['grade'] = self.grade
        theStudentDict['pagesRead'] = self.pagesRead
        theStudentDict['isbnList'] = self.books
        return theStudentDict

class Book(db.Model):
    title = db.StringProperty()
    genre = db.StringProperty()
    isbn = db.IntegerProperty()
    cover = db.StringProperty()
    libaryLink = db.StringProperty()

    def dict(self):
        theBookDict = {}
        theBookDict['title'] = self.title
        theBookDict['genre'] = self.genre
        theBookDict['isbn'] = self.isbn
        theBookDict['cover'] = self.cover
		theBookDict['link'] =self.libaryLink
        return theBookDict

#class Bookshelf(db.Model):#   books = db.ListProperty(long)
#  sort = db.IntegerProperty() # Sort by this variable
# positions = db.ListProperty(long)
    
app = webapp2.WSGIApplication([('/student()', StudentHandler), ('/student/(.*)', StudentHandler),
                               ('/book()', BookHandler), ('/login()',LoginHandler),
                               ('/.*', MainPage)], debug=True)
