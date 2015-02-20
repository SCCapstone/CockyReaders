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
class LoginHandler(MainPage):
    def get(self):
        if(self.request.get('logintype')==google):
             self.setupUser()
        if(self.request.get('logintype')==ourdata):
            self.loginUser = self.request.get('user')
            self.loginPassword = self.request.get('password')
            key =db.key.from_path('Student', loginUser )
            theStudent = db.get(key)
            if theStudent == None:
                self.redirct('/')
            if theStudent.password != loginPassword:
                self.redirct('/')
    def post(self):
        
class BookHandler(MainPage):
    def get(self, bookID): 
                
        self.setupUser()
        
        self.setupJSON(bookID)
        
     

        query = Book.all();
        #DEMO CODE
        if query.count() == 0:
            
            newBook = Book(title = "Sleeping Beauty", genre = "Fantasy", isbn = int(1113), cover = "img/book_1.jpg")
            newBook.put()
        
            newBook = Book(title = "Moby Dick", genre = "Fantasy", isbn = int(1113), cover = "img/book_1.jpg")
            newBook.put()
 
            newBook = Book(title = "Angels and Demons", genre = "Fantasy", isbn = int(1113), cover = "img/book_1.jpg")
            newBook.put()

            newBook = Book(title = "Piece of Crap", genre = "Fantasy", isbn = int(1113), cover = "img/book_1.jpg")
            newBook.put()
            
            query = Book.all()
        
        if self.json:
            self.response.headers.add_header('Access-Control-Allow-Origin', '*')
            self.response.out.headers['Content-Type'] = "text/json"
            books = []
            for book in query:
                books.append(book.dict())
            self.response.out.write(json.dumps(books))
            return       
        
        
        
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

        newStudent = Student(firstName = fName, lastName = lName, teacher = teacher, grade = int(grade), pagesRead = 0)
        newStudent.put()
        
        self.redirect('/student')            
        return
            
class Student(db.Model):
    firstName = db.StringProperty()
    lastName = db.StringProperty()
    userName = db.StringProperty()
    teacher = db.StringProperty()
    grade = db.IntegerProperty()
    bookshelf = db.Key()
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
        return theStudentDict

class Book(db.Model):
    title = db.StringProperty()
    genre = db.StringProperty()
    isbn = db.IntegerProperty()
    cover = db.StringProperty()

    def dict(self):
        theBookDict = {}
        theBookDict['title'] = self.title
        theBookDict['genre'] = self.genre
        theBookDict['isbn'] = self.isbn
        theBookDict['cover'] = self.cover
        return theBookDict

# books should only be a list of ISBN Numbers. the ISBN number are then refrecned through Books datastore and returned
#
#class Bookshelf(db.Model):#   books = db.ListProperty(long)
#  sort = db.IntegerProperty() # Sort by this variable
# positions = db.ListProperty(long)
    
app = webapp2.WSGIApplication([('/student()', StudentHandler), ('/student/(.*)', StudentHandler),
                               ('/book()', BookHandler), ('/login()',LoginHandler),
                               ('/.*', MainPage)], debug=True)
