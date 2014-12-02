#Author: Connor P. Bain
#HW 11
#Added canvas board
#Last modified November 26, 2012

import logging
import webapp2
import jinja2
import json
import os

from google.appengine.api import urlfetch
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import images
from google.appengine.ext import blobstore

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
        self.template_values['title'] = "Pinboard"
        self.render("main.html")    
       
    def getPin(self, pinID):
        key = db.Key.from_path('Pin', long(pinID))
        thePin = db.get(key)
        if thePin == None:
            self.redirect('/')
            return None
        return thePin   
        
    def getBoard(self, boardID):
        key = db.Key.from_path('Board', long(boardID))
        theBoard = db.get(key)
        if theBoard == None:
            return None
        if theBoard.private == True and theBoard.owner != self.currentUser:
            return None
        return theBoard   
        
class CanvasHandler(MainPage):        
    def get(self, boardID):
        self.setupUser()      
        boardID = self.setupJSON(boardID)  

        if boardID == '' and self.currentUser: # GET /pin returns the list of pins
            self.redirect("/board")
            return  
        
        theBoard = self.getBoard(boardID)

        if not theBoard:
            self.redirect("/")
            return
        
        if theBoard.owner == self.currentUser:
            self.template_values['editor'] = True
        else:
            self.template_values['editor'] = False

        self.template_values['board'] = theBoard
        self.template_values['title'] = theBoard.title
        self.render('canvas.html') 
        
class BoardHandler(MainPage):        
    def get(self, boardID):
        self.setupUser()          
        boardID = self.setupJSON(boardID)  

        if boardID == '' and self.currentUser: # GET /pin returns the list of pins
            query = Board.all().filter('owner =', self.currentUser) #Remember: "owner=" won't work!!!
            self.template_values['boards'] = query
            self.template_values['title'] = 'Your Boards'
            self.render('boardlist.html')
            return  
        
        theBoard = self.getBoard(boardID)

        if not theBoard:
            self.redirect("/")
            return
        
        if theBoard.owner == self.currentUser:
            self.template_values['editor'] = True;
        else:
            self.template_values['editor'] = False;
        
        allPins = []
        boardPins = []           
        
        query = Pin.all().filter("owner =", theBoard.owner)
        for pin in query:
            if theBoard.key() in pin.boards:
                boardPins.append(pin)
            else:
                allPins.append(pin)
                
        if self.json:#self.json:
                self.response.out.headers['Content-Type'] = "text/json"
                self.response.out.write(theBoard.json(boardPins))
                return
        
        self.template_values['boardPins'] = boardPins
        self.template_values['board'] = theBoard
        self.template_values['title'] = theBoard.title
        self.render('board.html')
                        
    def post(self, boardID):
        self.setupUser()
        
        
        title = self.request.get('title')
        private = self.request.get('privOpt')
        command = self.request.get('cmd')
        rPin = self.request.get('rPin')
        aPin = self.request.get('aPin')
        updateX = self.request.get('updateX')
        updateY = self.request.get('updateY')
        newWidths = self.request.get('updateWidth')
        newHeights = self.request.get('updateHeight')
        logging.info(updateX)
        
        if not self.currentUser:
            self.redirect('/')
            return
        
        if boardID == '': #new pin, create it
            if private == "on":
                private = True
            else:
                private = False
            newBoard = Board(title = title, private = private, owner = self.currentUser)
            newBoard.put()   
            newUrl = '/board/%s' % newBoard.id()
            self.redirect(newUrl)
  
        elif command == 'delete': #delete the pin
            logging.info(boardID)
            newBoard = self.getBoard(boardID)
            newBoard.deleteBoard()
            self.redirect('/board/')            
            return
        
        else:
            newBoard = self.getBoard(boardID)
            if private:
                logging.info("Updating private")
                if private == "true":
                    private = True 
                else:
                    private = False
                newBoard.private = private 
            if title:
                newBoard.title = title
                
            if updateX:
                newBoard.xValues = json.loads(updateX)
                newBoard.yValues = json.loads(updateY)
            
            if newWidths:
                newBoard.widths = json.loads(newWidths)
                newBoard.heights = json.loads(newHeights)
                
            newBoard.put()
                
            if aPin:
                temp = self.getPin(aPin)
                temp.boards.append(newBoard.key())
                temp.put()
            if rPin:
                temp = self.getPin(rPin)
                temp.boards.remove(newBoard.key())
                temp.put()    
                   
                        
class PinHandler(MainPage):
    def get(self, pinID): 
        self.setupUser()

        pinID = self.setupJSON(pinID)  
        
        if pinID == '' and self.currentUser: # GET /pin returns the list of pins       
            query = Pin.all().filter('owner =', self.currentUser)
            if self.json:
                self.response.out.headers['Content-Type'] = "text/json"
                pins = []
                for pin in query:
                    pins.append(pin.dict())
                self.response.out.write(json.dumps(pins))
                return               
            self.template_values['pins'] = query
            self.template_values['title'] = 'Your Pins'
            self.render('pinlist.html')
            return
        
        thePin = self.getPin(pinID)  
        boards = []
    
        if thePin.private and (self.currentUser != thePin.owner):
            self.redirect("/")
            return
        
        if self.json:#self.json:
            self.response.out.headers['Content-Type'] = "text/json"
            self.response.out.write(json.dumps(thePin.dict()))
            return
        
        for key in thePin.boards:
            boards.append(db.get(key))
        
        if self.currentUser == thePin.owner:
            self.template_values['editor'] = True
        else:
            self.template_values['editor'] = False
                 
        self.template_values['pin'] = thePin
        self.template_values['boards'] = boards
        self.template_values['title'] = 'Pin %s' % pinID
        self.render('pin.html')
        return
                        
    def post(self, pinID):
        self.setupUser()
        if not self.currentUser:
            self.redirect('/')
            return     
        
        theFile = self.request.POST[u'upFile'].file
        image = db.Blob(theFile.getvalue())
        imgUrl = self.request.get('imgUrl')
        upCaption = self.request.get('caption')
        command = self.request.get('cmd')
      
        if pinID == '': #new pin, create it
            if self.request.get('privOpt') == "on":
                private = True
            else:
                private = False
            
            logging.info("hello")
            if theFile:
                pinImage = db.Blob(image)    
                image = images.Image(image)
                upCaption = "Insert caption here."
                width = image.width
                height = image.height
            else:
                image = urlfetch.fetch(imgUrl)
                if image.status_code == 200:
                    pinImage = db.Blob(image.content)
                    image = images.Image(pinImage)
                    width = image.width
                    height = image.height
                else:
                    self.response.out.write("There was a problem loading the image.")
                    
            newPin = Pin(imgUrl = imgUrl, image = pinImage, width = width, height = height, caption = upCaption, private = private, owner = self.currentUser)
            newPin.put()
            newUrl = '/pin/%s' % newPin.id()
            newPin.imgUrl = '/pin/%s.jpg' % newPin.id()
            newPin.put()
            self.redirect('/')
            return
        elif command == 'delete': #delete the pin
            newPin = self.getPin(pinID)
            newPin.delete()
            self.redirect('/pin/')            
            return
        else: #existing pin, update it 
            private = self.request.get('privOpt')
            newPin = self.getPin(pinID)
            if upCaption:
                newPin.caption = upCaption
            if private:
                if private == "true":
                    private = True 
                else:
                    private = False
                newPin.private = private
            newPin.put()       

class ImageHandler(MainPage):
    def get(self, pinID):
        pinID = pinID.split('.')[0]
        thePin = self.getPin(pinID)
        if thePin:
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write(thePin.image)
        else:
            self.response.out.write("There was an error.")
            
class Pin(db.Model):
    imgUrl = db.StringProperty()
    image = db.BlobProperty(default=None)
    caption = db.StringProperty(indexed=False)
    date = db.DateTimeProperty(auto_now_add=True)
    owner = db.UserProperty(required=True)
    private = db.BooleanProperty(default=False)
    boards = db.ListProperty(db.Key, default=[])
    width = db.IntegerProperty()
    height = db.IntegerProperty()
    
    def id(self):
        return self.key().id()
    
    def dict(self):
        thePinDict = {}
        thePinDict['id'] = self.id()
        thePinDict['private'] = self.private
        thePinDict['imgUrl'] = self.imgUrl
        thePinDict['caption'] = self.caption
        thePinDict['width'] = self.width
        thePinDict['height'] = self.height
        return thePinDict
    
class Board(db.Model):
    title = db.StringProperty()
    private = db.BooleanProperty()
    owner = db.UserProperty()
    xValues = db.StringListProperty(default=[])
    yValues = db.StringListProperty(default=[])
    widths = db.ListProperty(int, default=[])
    heights = db.ListProperty(int, default=[])
    
    def id(self):
        return self.key().id()
    
    def json(self, boardPins):
        theBoardJSON = {}
        theBoardJSON['id'] = self.id()
        theBoardJSON['private'] = self.private
        theBoardJSON['title'] = self.title
        theBoardJSON['xValues'] = self.xValues
        theBoardJSON['yValues'] = self.yValues
        
        pinList = []
        for pin in boardPins:
            pinList.append(pin.dict())
            self.widths.append(pin.width)
            self.heights.append(pin.height)
        theBoardJSON['widths'] = self.widths
        theBoardJSON['heights'] = self.heights
        theBoardJSON['pins'] = pinList
        return json.dumps(theBoardJSON)
    
    def deleteBoard(self):
        query = Pin.all()
        for pin in query:
            if self.key() in pin.boards:
                pin.boards.remove(self.key())
                pin.put()
        self.delete()
        return
    
app = webapp2.WSGIApplication([('/canvas/(.*)', CanvasHandler),
                               ('/board/(.*)', BoardHandler), ('/board()', BoardHandler),
                               ('/pin/(.*).jpg', ImageHandler), ('/pin/(.*)', PinHandler), ('/pin()', PinHandler),
                               ('/.*', MainPage)], debug=True)