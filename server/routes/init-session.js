export default function initSession(req, res) {
  res.json({message: `Welcome ${req.socket.getPeerCertificate().subject.CN}! Secure channel is ready!`});
}
